import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';

import { CartByIdPipe } from './cart-by-id.pipe';
import { Cart } from './cart.entity';
import { CartMapper } from './cart.mapper';
import { CartService } from './cart.service';
import { CheckoutDto } from './checkout.dto';

@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
    private readonly cartMapper: CartMapper,
  ) {}

  @Get('/')
  public async listCarts() {
    return this.cartMapper.allToDto(
      await this.cartService.list(),
    );
  }

  @Post('/')
  public async addCart() {
    return this.cartMapper.toDto(
      await this.cartService.createNewCart(),
    );
  }

  @Post(':cartId/checkout')
  public async checkout(
    @Param('cartId', ParseIntPipe, CartByIdPipe) cart: Cart,
    @Body(ValidationPipe) checkout: CheckoutDto,
  ) {
    return this.cartService.checkout(cart, checkout.currency);
  }
}
