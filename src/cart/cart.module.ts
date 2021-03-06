import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CurrencyModule } from '../currency/currency.module';
import { CartController } from './cart.controller';
import { CartMapper } from './cart.mapper';
import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    forwardRef(() => ProductModule),
    TypeOrmModule.forFeature([CartRepository]),
    CurrencyModule,
  ],
  providers: [
    CartService,
    CartMapper,
  ],
  controllers: [
    CartController,
  ],
  exports: [
    CartService,
  ],
})
export class CartModule {}
