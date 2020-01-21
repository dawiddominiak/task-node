import { Rates } from '../common/value-objects/rates.value-object';

export interface CurrencyAdapter {
  getLatestRates(): Promise<Rates>;
}
