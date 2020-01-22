import { Rates } from './rates.entity';

export interface CurrencyAdapter {
  getLatestRates(): Promise<Rates>;
}
