import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyService } from './currency.service';
import {
  ExchangeRatesCurrencyAdapter,
} from './exchange-rates-adapter/exchange-rates.currency.adapter';
import { RatesRepository } from './rates.repository';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([RatesRepository]),
  ],
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
