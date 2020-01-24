import { AxiosResponse } from 'axios';

import { HttpService } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { Currency } from '../../common/value-object/currency.enum';
import { ExchangeRatesCurrencyAdapter } from './exchange-rates.currency.adapter';

import moment = require('moment');
async function getAdapterWithMockedHttp(mockedResponse: () => Promise<AxiosResponse>) {
  const module: TestingModule = await Test.createTestingModule({
    providers: [
      ExchangeRatesCurrencyAdapter,
      {
        provide: HttpService,
        useValue: {
          get: () => ({
            toPromise: mockedResponse,
          }),
        },
      },
    ],
  }).compile();

  return module.get<ExchangeRatesCurrencyAdapter>(ExchangeRatesCurrencyAdapter);
}

function mockAxiosResponse(data, status = 200) {
  let statusText = 'OK';

  if (status >= 400) {
    statusText = 'Error';
  }

  return () => Promise.resolve({
    data,
    status,
    statusText,
    headers: {},
    config: {},
  });
}

describe('ExchangeRatesCurrencyAdapter', () => {
  let service: ExchangeRatesCurrencyAdapter;
  describe('simple fetch', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              CAD: 1.4512,
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'EUR',
            date: '2020-01-21',
          }),
        );
      },
    );

    test('should get latest rates', async () => {
      const rates = await service.getLatestRates();

      expect(rates.date).toEqual(moment('2020-01-21', 'YYYY-MM-DD').add(16, 'hours').toDate());
      expect(rates.getConversionRate(Currency.EUR, Currency.CAD)).toEqual(1.4512);
    });
  });

  /**
   * It's better to not trust external APIs and handle all
   * unforseen situations.
   */
  describe('incorrect rate case - negative value', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              CAD: -1.4512, // negative value
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'EUR',
            date: '2020-01-21',
          }),
        );
      },
    );

    test('should throw an error', async () => {
      return expect(service.getLatestRates())
        .rejects
        .toEqual(
          expect.objectContaining({
            message: expect.stringContaining('Incorrect rate object.'),
          }),
        );
    });
  });

  describe('incorrect rate case - not existing currency', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              NOT: 1.4512, // not existing currency
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'EUR',
            date: '2020-01-21',
          }),
        );
      },
    );

    test('should throw an error', async () => {
      return expect(service.getLatestRates())
        .rejects
        .toEqual(
          expect.objectContaining({
            message: expect.stringContaining('Incorrect rate object.'),
          }),
        );
    });
  });

  describe('incorrect date case', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              CAD: 1.4512,
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'EUR',
            date: '3020-01-21', // strange year
          }),
        );
      },
    );

    test('should throw an error', async () => {
      return expect(service.getLatestRates())
        .rejects
        .toEqual(
          expect.objectContaining({
            message: expect.stringContaining('Incorrect date format.'),
          }),
        );
    });
  });

  describe('incorrect base case', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              CAD: 1.4512,
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'NOT', // not existing base
            date: '2020-01-21',
          }),
        );
      },
    );

    test('should throw an error', async () => {
      return expect(service.getLatestRates())
        .rejects
        .toEqual(
          expect.objectContaining({
            message: expect.stringContaining('base must be one of the following values'),
          }),
        );
    });
  });

  describe('too many properties case', () => {
    beforeEach(
      async () => {
        service = await getAdapterWithMockedHttp(
          mockAxiosResponse({
            rates: {
              CAD: 1.4512,
              JPY: 122.31,
              CHF: 1.0743,
            },
            base: 'EUR',
            date: '2020-01-21',
            unexpectedProperty: true,
          }),
        );
      },
    );

    test('additional property should be not visible', async () => {
      const rates = await service.getLatestRates();

      // tslint:disable-next-line: no-string-literal
      expect(rates['unexpectedProperty']).toBeUndefined();
    });
  });
});
