import { AxiosError, AxiosResponse } from 'axios';
import { validate, ValidationError } from 'class-validator';
import * as moment from 'moment';
import { EOL } from 'os';
import { ValueError } from 'src/common/error/ValueError';
import { RetryableWorker } from 'src/common/retryable-worker';

import { HttpService, Injectable, Logger } from '@nestjs/common';

import { Rates } from '../../common/value-objects/rates.value-object';
import { CurrencyAdapter } from '../currency.adapter';
import { ExchangeRatesDto } from './exchange-rates.dto';

const EXCHANGE_RATES_URL: string = 'https://api.exchangeratesapi.io/latest';

@Injectable()
export class ExchangeRatesCurrencyAdapter implements CurrencyAdapter {
  constructor(
    private readonly httpService: HttpService,
    private readonly logger: Logger,
  ) {}

  public async getLatestRates(): Promise<Rates> {
    const { data } = await this.fetchLatestData();
    const exchangeRatesDto = Object.assign(new ExchangeRatesDto(), {
      date: data?.date,
      rates: new Map(Object.entries(data?.rates)),
      base: data?.base,
    });
    const errors: ValidationError[] = await validate(exchangeRatesDto);

    if (errors.length > 0) {
      const messages = errors.map((error: ValidationError) => error.toString());

      throw new ValueError(`Unexpected response from ${EXCHANGE_RATES_URL}. ${messages.join(', ')}`);
    }

    return new Rates(
      moment(exchangeRatesDto.date, 'YYYY-MM-DD').toDate(),
      exchangeRatesDto.rates,
      exchangeRatesDto.base,
    );
  }

  private async fetchLatestData<T>(): Promise<AxiosResponse<any>> {
    return RetryableWorker.run(
      () => this.httpService.get<T>(EXCHANGE_RATES_URL).toPromise(),
      {
        repeatOptions: {
          limit: 3,
        },
        repeatCondition: (error: AxiosError) => {
          const isAxiosError: boolean = error.isAxiosError;
          const hasErrorCode: boolean = typeof error.code === 'string' || typeof error.code === 'number';
          const errorCodeFrom4xxGroup: boolean = error.code?.toString().charAt(0) === '4';
          const retryable = isAxiosError && hasErrorCode && !errorCodeFrom4xxGroup;

          this.logger.warn(
            `
              Error ${error.code} during the fetch from ${EXCHANGE_RATES_URL}.${EOL}
              ${ retryable ? 'Retrying' : 'Not retryable' }${EOL}
              ${error.message}${EOL}
              ${error.stack}
            `,
          );

          return retryable;
        },
      },
    );
  }

}
