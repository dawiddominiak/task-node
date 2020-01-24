import { Controller, Get } from '@nestjs/common';

import { CartService } from './cart.service';

@Controller()
export class CartController {
  constructor(
    private readonly cartService: CartService,
  ) {}

  @Get('/')
  public async listCarts() {
    // TODO: map to DTOs
    return this.cartService.list();
  }
}
