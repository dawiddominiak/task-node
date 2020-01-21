import { Module } from '@nestjs/common';

import { CartModule } from './cart/cart.module';
import { CommonModule } from './common/common.module';
import { CurrencyModule } from './currency/currency.module';

@Module({
  imports: [CartModule, CurrencyModule, CommonModule],
})
export class AppModule {}
