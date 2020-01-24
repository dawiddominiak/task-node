import { RouterModule } from 'nest-router';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { CartModule } from './cart/cart.module';
import { CurrencyModule } from './currency/currency.module';
import { DatabaseModule } from './database/database.module';
import { routes } from './routes';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: true,
    }),
    CartModule,
    CurrencyModule,
    DatabaseModule,
    RouterModule.forRoutes(routes),
  ],
})
export class AppModule {}
