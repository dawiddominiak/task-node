import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CartModule } from './cart/cart.module';
import { CurrencyModule } from './currency/currency.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    CartModule,
    CurrencyModule,
    DatabaseModule,
  ],
})
export class AppModule {}
