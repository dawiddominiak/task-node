import { Currency } from './currency.enum';

export interface Ratable {
  date: Date;
  getConversionRate(currentCurrency: Currency, targetCurrency: Currency);
}
