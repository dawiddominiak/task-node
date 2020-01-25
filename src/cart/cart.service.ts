import { Injectable } from '@nestjs/common';

import { CRUDService } from '../common/service/crud.service';
import { Cart } from './cart.entity';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService extends CRUDService<Cart> {
  constructor(respository: CartRepository) {
    super(respository);
  }

  public async createNewCart(): Promise<Cart> {
    const cart = this.repository.create({
      products: [],
      paid: false,
    });

    return this.repository.save(cart);
  }
}
