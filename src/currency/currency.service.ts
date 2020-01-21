import { Rates } from 'src/common/value-objects/rates.value-object';

import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';

import { CurrencyAdapter } from './currency.adapter';

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
  @Cron('0 16 * * *', {
    timeZone: 'Europe/Berlin', // European Central Bank headquarters.
  })
  private async updateCurrencies() {

  }

  private async fetchNewestCurrencies(): Promise<Rates> {
    return this.currencyAdapter.getLatestRates();
  }
}
