import { Rates } from '../../currency/rates.entity';
import { Currency } from './currency.enum';
import { Money } from './money.value-object';

describe('Money', () => {
  it('should create a Money object', () => {
    const money = new Money(1.00, Currency.PLN);

    expect(money.amount).toEqual(1.00);
    expect(money.currency).toEqual(Currency.PLN);
  });

  it('should correctly create a Money object from incorrect float input', () => {
    // IEEE 753 float representation of number 0.1 is problematic.
    // See more: https://stackoverflow.com/questions/3448777/how-to-represent-0-1-in-floating-point-arithmetic-and-decimal .
    // About the IEEE 754 number representation standard: https://en.wikipedia.org/wiki/IEEE_754-1985 .
    // Money type should take care of it.
    const money = new Money(0.1 + 0.2, Currency.EUR);

    expect(money.amount).toEqual(0.3);
    expect(money.currency).toEqual(Currency.EUR);
  });

  describe('.getAmountMultipliedBy', () => {
    let money: Money;

    beforeEach(() => {
      money = new Money(10.50, Currency.CHF);
    });

    it('should multiply the amount of money by factor 2', () => {
      expect(
        money.getAmountMultipliedBy(2),
      ).toBe(21);
    });

    it('should multiply the amount of money by factor 0.0000001 and round the multiplied amount to 0', () => {
      expect(
        money.getAmountMultipliedBy(0.0000001),
      ).toBe(0);
    });
  });

  describe('.showAmontInDifferentCurrency', () => {
    const rates = new Rates(
      new Date(),
      new Map(Object.entries({
        [Currency.PLN]: 4.23,
        [Currency.USD]: 1.21,
        [Currency.PHP]: 10e10, // Probably not a real one
      })) as unknown as Map<Currency, number>,
    );

    it('should show the amount of money in a different currency', () => {
      const pln200 = new Money(200, Currency.PLN);

      expect(
        pln200.showAmontInDifferentCurrency(rates, Currency.USD),
      ).toEqual(57.21);
    });

    it('should show the amount of money in a base currency', () => {
      const pln200 = new Money(200, Currency.PLN);

      expect(
        pln200.showAmontInDifferentCurrency(rates, Currency.EUR),
      ).toEqual(47.28);
    });

    it('should show the amount of money with base currency as amount', () => {
      const eur50 = new Money(50, Currency.EUR);

      expect(
        eur50.showAmontInDifferentCurrency(rates, Currency.PLN),
      ).toEqual(211.5);
    });

    it('should show the value 0.01, not 0.00', () => {
      const php1 = new Money(1, Currency.PHP);

      expect(
        php1.showAmontInDifferentCurrency(rates, Currency.EUR),
      ).toEqual(0.01);
    });

    it('should show the value -0.01, not 0.00', () => {
      const php1 = new Money(-1, Currency.PHP);

      expect(
        php1.showAmontInDifferentCurrency(rates, Currency.EUR),
      ).toEqual(-0.01);
    });
  });

  describe('.fixFloatingPointError', () => {
    it('should fix floating point error', () => {
      const amount = Money.fixFloatingPointError(0.1 + 0.2);

      expect(amount).toEqual(0.3);
    });
  });

  describe('.multiply', () => {
    it('should multiply money by factor 2', () => {
      const money = new Money(1, Currency.EUR);
      const moreMoney = Money.multiply(money, 2);

      expect(moreMoney.amount).toEqual(2);
      expect(moreMoney.currency).toEqual(Currency.EUR);
    });
  });

  describe('.add', () => {
    const rates = new Rates(
      new Date(),
      new Map(Object.entries({
        [Currency.PLN]: 4.23,
        [Currency.USD]: 1.21,
        [Currency.JPY]: 121.8,
      })) as unknown as Map<Currency, number>,
    );

    it('should add money objects with different currencies.', () => {
      const sum = Money.add(
        [
          new Money(100, Currency.PLN),
          new Money(10, Currency.EUR),
          new Money(1000, Currency.JPY),
        ],
        rates,
        Currency.PLN,
      );

      expect(sum.amount).toEqual(177.03);
    });
  });
});
