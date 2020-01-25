import { Controller, Get, Post } from '@nestjs/common';

import { CartMapper } from './cart.mapper';
import { CartService } from './cart.service';

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
}
