import { AxiosError } from 'axios';
import * as moment from 'moment';

import { Inject, Injectable, Logger, LoggerService, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { RetryableWorker } from '../common/retryable-worker';
import {
  determineIfErrorIsNotIn400Group,
} from '../common/retryable-worker/deny-400-group.repeat-condition';
import { CurrencyAdapter } from './currency.adapter';
import {
  DAILY_UPDATE_OFFSET_IN_HOURS, UPDATE_TIMEZONE,
} from './exchange-rates-adapter/exchange-rates.currency.adapter';
import { RatesNotUpdatedError } from './rates-not-updated.error';
import { Rates } from './rates.entity';
import { RatesRepository } from './rates.repository';

// Daily update will happen 5 minutes after hour defined in DAILY_UPDATE_OFFSET_IN_HOURS.
const CRON_MINUTES_OFFSET: number = 5;
const RETRIES_LIMIT_OF_CURRENCIES_ADAPTER: number = 15;

@Injectable()
export class CurrencyService implements OnModuleInit {
  private readonly logger: LoggerService;

  constructor(
    private readonly ratesRepository: RatesRepository,
    @Inject('CurrencyAdapter') private readonly currencyAdapter: CurrencyAdapter,
  ) {
    this.logger = new Logger('CurrencyService');
  }

  // It's important to ensure newest rates before application bootstrap.
  public async onModuleInit(): Promise<void> {
    if (process.env.NODE_ENV !== 'test') {
      await this.ensureNewestCurrencies();
    }
  }

  public async getLatestRates(): Promise<Rates> {
    return this.ratesRepository.getLatestRates();
  }

  /**
   * For productional purposes it should be considered
   * as a separate microservice.
   */
  @Cron(`${CRON_MINUTES_OFFSET} ${DAILY_UPDATE_OFFSET_IN_HOURS} * * *`, {
    timeZone: UPDATE_TIMEZONE,
  })
  private async ensureNewestCurrencies(): Promise<void> {
    const latestRates = await this.getLatestRates();
    const latestRatesMoment = moment(latestRates?.date);
    const currentMoment = moment();

    if (!latestRates || currentMoment.diff(latestRatesMoment, 'hours') >= 24) {
      const newestRates = await this.fetchNewestCurrencies(latestRates);
      if (newestRates) {
        this.logger.log(`Rates from ${moment(newestRates.date).format('YYYY-MM-DD')} downloaded.`);
        await this.ratesRepository.save(newestRates);
      }
    }
  }

  private async fetchNewestCurrencies(oldRates: Rates): Promise<Rates | void> {
    // Currency adapter should have retryable logic already implemented,
    // we just want to use higher resolution.
    try {
      return RetryableWorker.run(
        async () => {
          const newRates = await this.currencyAdapter.getLatestRates();

          if (oldRates && newRates.date.getTime() === oldRates?.date?.getTime()) {
            throw new RatesNotUpdatedError(`Rates not updated at ${new Date()}.`);
          }

          return newRates;
        },
        {
          repeatOptions: {
            limit: RETRIES_LIMIT_OF_CURRENCIES_ADAPTER,
            // 5s, 20s, 45s, 1m20s, 2m5s, 3m, 4m5s, ... 15m, 15m
            msDelayFactory: (approachCounter) => Math.max((approachCounter ** 2) * 5000, 15 * 60 * 1000),
          },
          repeatCondition: (error: AxiosError | RatesNotUpdatedError) => {
            if (error instanceof RatesNotUpdatedError) {
              this.logger.warn(error.message);

              return true;
            }

            return determineIfErrorIsNotIn400Group(error, this.logger);
          },
        },
      );
    } catch (error) {
      if (error instanceof RatesNotUpdatedError) {
        this.logger.error(`Rates not updated despite ${RETRIES_LIMIT_OF_CURRENCIES_ADAPTER} retries.`);
      } else {
        throw error;
      }
    }
  }
}
