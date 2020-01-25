import {
  Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Post, ValidationPipe,
} from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { CartByIdPipe } from '../cart-by-id.pipe';
import { CartNotPaidValidationPipe } from '../cart-not-paid.pipe';
import { Cart } from '../cart.entity';
import { ProductDto } from './product.dto';
import { ProductMapper } from './product.mapper';
import { ProductService } from './product.service';

@Controller()
export class ProductController {
  constructor(
    private readonly productService: ProductService,
    private readonly productMapper: ProductMapper,
  ) {}

  @Post('/')
  @ApiParam({ name: 'cartId', type: String })
  public async addProduct(
    @Param('cartId', ParseIntPipe, CartByIdPipe, CartNotPaidValidationPipe) cart: Cart,
    @Body(ValidationPipe) productDto: ProductDto,
  ) {
    const product = this.productMapper.toEntity(productDto);
    product.cart = cart;

    return this.productMapper.toDto(
      await this.productService.save(product),
    );
  }

  @Delete('/:productId')
  @HttpCode(204)
  @ApiParam({ name: 'cartId', type: String })
  public async deleteProduct(
    @Param('cartId', ParseIntPipe, CartByIdPipe, CartNotPaidValidationPipe) cart: Cart,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.productService.delete(productId);
  }
}
