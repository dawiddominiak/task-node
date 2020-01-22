import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';

import { Currency } from '../../common/value-objects/currency.enum';

@ValidatorConstraint({ name: 'areRatesCorrect', async: false })
export class AreRatesCorrect implements ValidatorConstraintInterface {
  public validate(values: Map<Currency, number>): boolean {
    for (const [currency, rate] of values) {
      if (!Object.values(Currency).includes(currency) || typeof rate !== 'number' || rate < 0) {
        return false;
      }
    }

    return true;
  }

  public defaultMessage?(): string {
    return 'Incorrect rate object.';
  }
}
