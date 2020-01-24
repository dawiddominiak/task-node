import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartRepository } from './cart.repository';
import { CartService } from './cart.service';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ProductModule,
    TypeOrmModule.forFeature([CartRepository]),
  ],
  providers: [
    CartService,
  ],
})
export class CartModule {}
