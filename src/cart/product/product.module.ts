import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductRepository]),
  ],
  providers: [
    ProductService,
  ],
})
export class ProductModule {}
