import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { Rates } from '../common/value-objects/rates.value-object';
import { CurrencyAdapter } from './currency.adapter';
import {
  DAILY_UPDATE_OFFSET_IN_HOURS,
} from './exchange-rates-adapter/exchange-rates.currency.adapter';

@Injectable()
export class CurrencyService implements OnModuleInit {
  constructor(
    @Inject('CurrencyAdapter') private readonly currencyAdapter: CurrencyAdapter,
  ) { }

  public async onModuleInit(): Promise<void> {
    await this.updateCurrencies();
  }

  /**
   * For productional purposes it should be considered
   * as a separate microservice.
   */
  @Cron(`0 ${DAILY_UPDATE_OFFSET_IN_HOURS} * * *`, {
    timeZone: 'Europe/Berlin', // European Central Bank headquarters.
  })
  private async updateCurrencies() {

  }

  private async fetchNewestCurrencies(): Promise<Rates> {
    return this.currencyAdapter.getLatestRates();
  }
}
