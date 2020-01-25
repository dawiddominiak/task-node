import { Injectable } from '@nestjs/common';

import { CRUDService } from '../common/service/crud.service';
import { Currency } from '../common/value-object/currency.enum';
import { Money } from '../common/value-object/money.value-object';
import { CurrencyService } from '../currency/currency.service';
import { Cart } from './cart.entity';
import { CartRepository } from './cart.repository';

@Injectable()
export class CartService extends CRUDService<Cart> {
  constructor(
    respository: CartRepository,
    private readonly currencyService: CurrencyService,
  ) {
    super(respository);
  }

  public async createNewCart(): Promise<Cart> {
    const cart = this.repository.create({
      products: [],
      paid: false,
    });

    return this.repository.save(cart);
  }

  public async checkout(cart: Cart, targetCurrency: Currency): Promise<Money> {
    cart.paid = true;
    const rates = await this.currencyService.getLatestRates();

    await this.save(cart);

    return cart.calculateTotalPrice(rates, targetCurrency);
  }
}
