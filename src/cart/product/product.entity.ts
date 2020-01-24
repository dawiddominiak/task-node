import { Currency } from 'src/common/value-object/currency.enum';
import { Ratable } from 'src/common/value-object/ratable';
import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Money } from '../../common/value-object/money.value-object';
import { Cart } from '../cart.entity';

@Entity({})
export class Product {
  @PrimaryGeneratedColumn()
  public readonly id: number;

  @Column({ type: 'text', nullable: false })
  private readonly name: string;

  @Column(type => Money)
  public readonly price: Money;

  @Column({ type: 'int', nullable: false })
  public readonly quantity: number;

  @Column({ type: 'text', nullable: true })
  private readonly description: string;

  @ManyToOne(type => Cart, cart => cart.products)
  public readonly cart: Cart;

  public calculateTotalValue() {
    return Money.multiply(this.price, this.quantity);
  }
}