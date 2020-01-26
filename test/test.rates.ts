import { Currency } from '../src/common/value-object/currency.enum';
import { Rates } from '../src/currency/rates.entity';

export const rates: Rates = new Rates(
  new Date(),
  new Map(Object.entries({
    PLN: 4.32133111111,
    GBP: 0.89234121211,
    USD: 1.11123121134,
  })) as unknown as Map<Currency, number>,
  Currency.EUR,
);
