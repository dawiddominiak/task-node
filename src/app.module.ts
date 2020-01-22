import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CartModule } from './cart/cart.module';
import { CommonModule } from './common/common.module';
import { CurrencyModule } from './currency/currency.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    CartModule,
    CurrencyModule,
    CommonModule,
    DatabaseModule,
  ],
})
export class AppModule {}
