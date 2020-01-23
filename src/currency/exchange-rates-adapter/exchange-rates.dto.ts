import { IsIn, Matches, Validate } from 'class-validator';

import { Currency } from '../../common/value-object/currency.enum';
import { AreRatesCorrect } from './rates.validator';

export class ExchangeRatesDto {
  @Matches(/^([12]\d{3}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]))$/, {
    message: 'Incorrect date format.',
  })
  date: string;

  @Validate(AreRatesCorrect)
  rates: Map<Currency, number>;

  @IsIn(Object.values(Currency))
  base: Currency;
}
