import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Currency } from '../common/value-object/currency.enum';
import { Money } from '../common/value-object/money.value-object';
import { Ratable } from '../common/value-object/ratable';
import { Product } from './product/product.entity';

@Entity({})
export class Cart {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column({ type: 'boolean' })
  public paid: boolean;

  @OneToMany(type => Product, product => product.cart, {
    eager: true,
  })
  public readonly products: Product[];

  public calculateTotalPrice(rates: Ratable, targetCurrency: Currency) {
    return Money.add(
      this.products.map(product => product.calculateTotalValue()),
      rates,
      targetCurrency,
    );
  }
}
