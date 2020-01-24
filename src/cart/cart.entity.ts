import { Currency } from 'src/common/value-object/currency.enum';
import { Money } from 'src/common/value-object/money.value-object';
import { Ratable } from 'src/common/value-object/ratable';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { Product } from './product/product.entity';

@Entity({})
export class Cart {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column({ type: 'boolean' })
  public readonly paid: boolean;

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
