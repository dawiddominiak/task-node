import { ConflictException, Injectable, PipeTransform } from '@nestjs/common';

import { Cart } from './cart.entity';

@Injectable()
export class CartNotPaidValidationPipe implements PipeTransform<Cart> {

  public async transform(cart: Cart) {
    if (cart.paid) {
      throw new ConflictException('The cart is already paid.');
    }

    return cart;
  }

}
