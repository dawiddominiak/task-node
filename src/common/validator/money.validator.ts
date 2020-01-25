import {
  ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface,
} from 'class-validator';

import { Currency } from '../value-object/currency.enum';
import { Money } from '../value-object/money.value-object';

@ValidatorConstraint({ name: 'money', async: false })
export class MoneyValidator implements ValidatorConstraintInterface {
  public validate(money: Money, { constraints }: ValidationArguments): boolean {
    return this.getValidationErrors(money, constraints).length === 0;
  }

  public defaultMessage?({ value, constraints }: ValidationArguments): string {
    const errors = this.getValidationErrors(value, constraints);

    return `The following errors occured: ${errors.join(', ')}.`;
  }

  private getValidationErrors(money: Money, [min, max]: number[]): string[] {
    const errors: string[] = [];

    if (money.amount < min) {
      errors.push(`amount of money lower than ${min}`);
    }

    if (money.amount > max) {
      errors.push(`amount of money higher than ${max}`);
    }

    if (!Object.values(Currency).includes(money.currency)) {
      errors.push(`unsupported currency ${money.currency}`);
    }

    return errors;
  }
}
