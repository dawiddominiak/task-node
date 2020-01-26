import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyService } from './currency.service';
import {
  ExchangeRatesCurrencyAdapter,
} from './exchange-rates-adapter/exchange-rates.currency.adapter';
import { RatesRepository } from './rates.repository';

const imports = [
  HttpModule,
  TypeOrmModule.forFeature([RatesRepository]),
];

if (process.env.NODE_ENV !== 'test') {
  // Working Cron Job is not needed during e2e tests.
  imports.push(ScheduleModule.forRoot());
}

@Module({
  imports,
  providers: [
    CurrencyService,
    {
      provide: 'CurrencyAdapter',
      useClass: ExchangeRatesCurrencyAdapter,
    },
  ],
  exports: [
    CurrencyService,
  ],
})
export class CurrencyModule {}
