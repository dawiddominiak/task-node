import { Body, Controller, Delete, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ApiParam } from '@nestjs/swagger';

import { CartByIdPipe } from '../cart-by-id.pipe';
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
    @Param('cartId', ParseIntPipe, CartByIdPipe) cart: Cart,
    @Body() productDto: ProductDto,
  ) {
    const product = this.productMapper.toEntity(productDto);
    product.cart = cart;

    return this.productMapper.toDto(
      await this.productService.save(product),
    );
  }

  @Delete('/:productId')
  public async deleteProduct(
    @Param('cartId', ParseIntPipe) cartId: number,
    @Param('productId', ParseIntPipe) productId: number,
  ) {
    await this.productService.delete(productId);
  }
}
