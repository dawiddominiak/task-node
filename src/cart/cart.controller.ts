import { Body, Controller, Get, Param, ParseIntPipe, Post, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';

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
  @ApiOperation({
    description: 'Lists all the carts available in the system',
  })
  public async listCarts() {
    return this.cartMapper.allToDto(
      await this.cartService.list(),
    );
  }

  @Post('/')
  @ApiOperation({
    description: 'Creates a new cart and returns an object of newly created cart.',
  })
  public async addCart() {
    return this.cartMapper.toDto(
      await this.cartService.createNewCart(),
    );
  }

  @Post(':cartId/checkout')
  @ApiOperation({
    description: 'Endpoint to do the checkout action, prevent cart from the future changes and calculate the amount of money in given currency.',
  })
  @ApiParam({ name: 'cartId', type: String })
  public async checkout(
    @Param('cartId', ParseIntPipe, CartByIdPipe) cart: Cart,
    @Body(ValidationPipe) checkout: CheckoutDto,
  ) {
    return this.cartService.checkout(cart, checkout.currency);
  }
}
