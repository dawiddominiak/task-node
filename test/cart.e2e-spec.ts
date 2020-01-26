import * as request from 'supertest';
import { Connection } from 'typeorm';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';
import { RatesRepository } from '../src/currency/rates.repository';
import { rates } from './test.rates';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());

    await app.init();

    const dbConnection = moduleFixture.get(Connection);
    await dbConnection.synchronize(true);
    const ratesRepository = moduleFixture.get(RatesRepository);
    // The service to fetch currencies is turned off during the e2e tests.
    await ratesRepository.save(rates);
  });

  describe('/cart', () => {
    test('/ (GET)', async () => {
      return request(app.getHttpServer())
        .get('/cart/')
        .expect(200)
        .then(({ body }) => {
          expect(body).toEqual([]);
        });
    });

    test('/ (POST)', async () => {
      return request(app.getHttpServer())
        .post('/cart/')
        .expect(201)
        .then(({ body }) => {
          expect(body).toEqual({
            id: 1,
            paid: false,
            products: [],
          });
        });
    });
  });

  describe('/cart/{cartId}', () => {
    test('POST invalid product', async () => {
      // GIVEN
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: -10.35,
          currency: 'EUR',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
      };

      // WHEN
      const addCartResponse = await request(app.getHttpServer())
        // Create a cart
        .post('/cart/')
        .expect(201);

      const { body } = await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(invalidProduct)
        .expect(400);

      // THEN
      expect(body.message[0]?.constraints?.money).toEqual(
        expect.stringContaining('amount of money lower than 0'),
      );
    });
  });

  describe('/cart/{cartId}/checkout', () => {
    test('POST products to do the checkout', async () => {
      // GIVEN
      const product1 = {
        name: 'Jeans',
        price: {
          amount: 10.35,
          currency: 'EUR',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
      };

      const product2 = {
        name: 'T-shirt',
        price: {
          amount: 4.75,
          currency: 'GBP',
        },
        quantity: 1,
        description: 'Blue T-shirt.',
      };

      // WHEN
      const addCartResponse = await request(app.getHttpServer())
        // Create a cart
        .post('/cart/')
        .expect(201);

      const addProduct1Response = await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(product1)
        .expect(201);

      const addProduct2Response = await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(product2)
        .expect(201);

      const checkoutResponse = await request(app.getHttpServer())
        // Checkout
        .post(`/cart/${addCartResponse.body.id}/checkout`)
        .send({
          currency: 'PLN',
        })
        .expect(201);

      // THEN
      expect(addProduct1Response.body).toEqual({
        id: 1,
        ...product1,
      });

      expect(addProduct2Response.body).toEqual({
        id: 2,
        ...product2,
      });

      expect(checkoutResponse.body).toEqual({
        amount: 67.73,
        currency: 'PLN',
      });
    });
  });
});
