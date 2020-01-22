import { HttpModule, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import { DatabaseModule } from '../database/database.module';
import { CurrencyService } from './currency.service';
import {
  ExchangeRatesCurrencyAdapter,
} from './exchange-rates-adapter/exchange-rates.currency.adapter';

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  providers: [
    CurrencyService,
    {
      provide: 'CurrencyAdapter',
      useClass: ExchangeRatesCurrencyAdapter,
    },
  ],
})
export class CurrencyModule {}
