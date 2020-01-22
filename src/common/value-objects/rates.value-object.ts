import { Currency } from './currency.enum';

export class Rates {
  constructor(
    public readonly date: Date,
    private readonly rates: Map<Currency, number>,
    private readonly base: Currency = Currency.EUR,
  ) { }

  public getConversionRate(currentCurrency: Currency, targetCurrency: Currency) {
    const currentToBaseRate: number = currentCurrency === this.base ? 1 : 1 / this.rates.get(currentCurrency);
    const baseToTargetRate: number = this.base === targetCurrency ? 1 : this.rates.get(targetCurrency);

    return currentToBaseRate * baseToTargetRate;
  }
}
