import * as R from 'ramda';
import { Column } from 'typeorm';

import { ApiProperty } from '@nestjs/swagger';

import { Currency } from '../value-object/currency.enum';
import { Ratable } from './ratable';
import { ValueObject } from './value-object';

/**
 * Immutable money type is a standard pattern to take care
 * of all money related problems, including
 * IEEE 753 floating point representation issues
 * (especially number 0.1) and all currency converting issues.
 * The money type should represent a price of a meaningful
 * group of products and should not be considered as a part
 * of an isolated calculation process.
 *
 * Caution: Currency conversion should take place only once!
 *
 * See more: https://martinfowler.com/eaaCatalog/money.html
 */
export class Money extends ValueObject {
  /**
   * Consider decimal type on productional database.
   */
  @Column({ type: 'float', name: 'price', nullable: false })
  @ApiProperty({
    description: 'Amount of money in the specified currency.',
    example: 10.35,
  })
  public readonly amount: number;

  @Column({ type: 'text', nullable: false })
  @ApiProperty({
    enum: Object.values(Currency),
    examples: Object.values(Currency),
  })
  public readonly currency: Currency;

  constructor(
    amount: number,
    currency: Currency,
  ) {
    super();
    this.amount = Money.fixFloatingPointError(amount);
    this.currency = currency;
  }

  public static multiply(money: Money, factor: number): Money {
    return new Money(
      money.getAmountMultipliedBy(factor),
      money.currency,
    );
  }

  public static fixFloatingPointError(amount: number) {
    return R.pipe(
      R.multiply(100),
      Math.round,
      R.divide(R.__, 100),
    )(amount);
  }

  public static add(moneyList: Money[], rates: Ratable, targetCurrency: Currency) {
    const amount: number = moneyList.reduce(
      (sum: number, money: Money) => sum + money.showAmontInDifferentCurrency(rates, targetCurrency),
      0,
    );

    return new Money(amount, targetCurrency);
  }

  public getAmountMultipliedBy(factor) {
    return R.pipe(
      R.multiply(this.amount),
      Money.fixFloatingPointError,
    )(factor);
  }

  public showAmontInDifferentCurrency(rates: Ratable, targetCurrency: Currency): number {
    if (this.amount === 0) {
      return 0;
    }

    if (this.currency === targetCurrency) {
      return this.amount;
    }

    const conversionRate: number = rates.getConversionRate(this.currency, targetCurrency);
    const amountInTargetCurrency = this.getAmountMultipliedBy(conversionRate);

    // Do not allow to return 0.00 in different currency if the input was significant.
    if (this.amount > 0) {
      return Math.max(0.01, amountInTargetCurrency);
    } else {
      return Math.min(-0.01, amountInTargetCurrency);
    }
  }
}
