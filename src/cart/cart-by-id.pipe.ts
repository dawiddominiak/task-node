import { Injectable, PipeTransform } from '@nestjs/common';

import { CartService } from './cart.service';

@Injectable()
export class CartByIdPipe implements PipeTransform<number> {
  constructor(
    private readonly cartService: CartService,
  ) { }

  public async transform(cartId: number) {
    return this.cartService.find(cartId);
  }

}
