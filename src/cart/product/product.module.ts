import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CartModule } from '../cart.module';
import { ProductController } from './product.controller';
import { ProductMapper } from './product.mapper';
import { ProductRepository } from './product.repository';
import { ProductService } from './product.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProductRepository]),
    forwardRef(() => CartModule),
  ],
  providers: [
    ProductService,
    ProductMapper,
  ],
  controllers: [
    ProductController,
  ],
  exports: [
    ProductMapper,
  ],
})
export class ProductModule {}
