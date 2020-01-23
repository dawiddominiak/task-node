import { Ratable } from 'src/common/value-object/ratable';
import { DateValueTransformer } from 'src/common/value-transformer/date.value-transformer';
import { JSONValueTransformer } from 'src/common/value-transformer/json.value-transformer';
import { Column, Entity, PrimaryColumn } from 'typeorm';

import { Currency } from '../common/value-object/currency.enum';

@Entity({
  withoutRowid: true,
})
export class Rates implements Ratable {
  @PrimaryColumn({
    type: 'int8',
    unique: true,
    transformer: new DateValueTransformer(),
  })
  public readonly date: Date;

  @Column({ type: 'text', transformer: new JSONValueTransformer() })
  private readonly rates: Map<Currency, number>;

  @Column({ type: 'text' })
  private readonly base: Currency;

  constructor(
    date: Date,
    rates: Map<Currency, number>,
    base: Currency = Currency.EUR,
  ) {
    this.date = date;
    this.rates = rates;
    this.base = base;
  }

  public getConversionRate(currentCurrency: Currency, targetCurrency: Currency) {
    const currentToBaseRate: number = currentCurrency === this.base ? 1 : 1 / this.rates.get(currentCurrency);
    const baseToTargetRate: number = this.base === targetCurrency ? 1 : this.rates.get(targetCurrency);

    return currentToBaseRate * baseToTargetRate;
  }
}
