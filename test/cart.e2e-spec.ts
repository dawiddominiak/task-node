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

  async function createCartWithProducts(products: any[]) {
    const productResponses = [];

    const addCartResponse = await request(app.getHttpServer())
      // Create a cart
      .post('/cart/')
      .expect(201);

    for (const product of products) {
      productResponses.push(
        await request(app.getHttpServer())
          // Add a product
          .post(`/cart/${addCartResponse.body.id}/product`)
          .send(product)
          .expect(201),
      );
    }

    return { productResponses, addCartResponse };
  }

  beforeEach(async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));

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
    async function testProductValidation(invalidProduct: any, constraint: string, errorMessage: string) {
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
      expect(body.message[0]?.constraints[constraint]).toEqual(
        expect.stringContaining(errorMessage),
      );
    }

    test('POST invalid product - negative amount', async () => {
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: -10.35,
          currency: 'EUR',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
      };

      await testProductValidation(invalidProduct, 'money', 'amount of money lower than 0');
    });

    test('POST invalid product - too high amount', async () => {
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: 1e20,
          currency: 'EUR',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
      };

      await testProductValidation(invalidProduct, 'money', 'amount of money higher than 10000000000');
    });

    test('POST invalid product - wrong currency', async () => {
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: 100,
          currency: 'FOO',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
      };

      await testProductValidation(invalidProduct, 'money', 'unsupported currency FOO');
    });

    test('POST invalid product - negative quantity', async () => {
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: 100,
          currency: 'EUR',
        },
        quantity: -1,
        description: 'Blue jeans with lining.',
      };

      await testProductValidation(invalidProduct, 'min', 'quantity must not be less than 0');
    });

    test('POST invalid product - wrong object', async () => {
      const invalidProduct = {
        foo: 'bar',
      };

      const addCartResponse = await request(app.getHttpServer())
        // Create a cart
        .post('/cart/')
        .expect(201);

      await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(invalidProduct)
        .expect(400);
    });

    test('POST invalid product - additional object property', async () => {
      const invalidProduct = {
        name: 'Jeans',
        price: {
          amount: 100,
          currency: 'EUR',
        },
        quantity: 1,
        description: 'Blue jeans with lining.',
        foo: 'bar',
      };

      await testProductValidation(invalidProduct, 'whitelistValidation', 'property foo should not exist');
    });

    test('POST valid product without an optional description', async () => {
      const product = {
        name: 'Jeans',
        price: {
          amount: 100,
          currency: 'EUR',
        },
        quantity: 1,
      };

      const addCartResponse = await request(app.getHttpServer())
        // Create a cart
        .post('/cart/')
        .expect(201);

      await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(product)
        .expect(201);
    });

    test('DELETE product from a cart', async () => {
      const product = {
        name: 'Jeans',
        price: {
          amount: 100,
          currency: 'EUR',
        },
        quantity: 1,
      };

      const { productResponses, addCartResponse } = await createCartWithProducts([product]);

      const getCartResponseBeforeProductRemoval = await request(app.getHttpServer())
        .get('/cart')
        .expect(200);

      expect(getCartResponseBeforeProductRemoval.body[0].products).toHaveLength(1);

      await request(app.getHttpServer())
        // Remove a product
        .delete(`/cart/${addCartResponse.body.id}/product/${productResponses[0].body.id}`)
        .expect(204);

      const getCartResponseAfterProductRemoval = await request(app.getHttpServer())
        .get('/cart')
        .expect(200);

      expect(getCartResponseAfterProductRemoval.body[0].products).toHaveLength(0);
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
      const { productResponses, addCartResponse } = await createCartWithProducts([product1, product2]);

      const checkoutResponse = await request(app.getHttpServer())
        // Checkout
        .post(`/cart/${addCartResponse.body.id}/checkout`)
        .send({
          currency: 'PLN',
        })
        .expect(201);

      // THEN
      expect(productResponses[0].body).toEqual({
        id: 1,
        ...product1,
      });

      expect(productResponses[1].body).toEqual({
        id: 2,
        ...product2,
      });

      expect(checkoutResponse.body).toEqual({
        amount: 67.73,
        currency: 'PLN',
      });
    });

    test('Checkout of an empty cart', async () => {
      // WHEN
      const { addCartResponse } = await createCartWithProducts([]);

      const { body } = await request(app.getHttpServer())
        // Checkout
        .post(`/cart/${addCartResponse.body.id}/checkout`)
        .send({
          currency: 'PLN',
        })
        .expect(201);

      expect(body).toEqual({
        amount: 0,
        currency: 'PLN',
      });
    });

    test('Checkout with an invalid object', async () => {
      // WHEN
      const { addCartResponse } = await createCartWithProducts([]);

      const { body } = await request(app.getHttpServer())
        // Checkout
        .post(`/cart/${addCartResponse.body.id}/checkout`)
        .send({
          $mongoInjectionTry: 'delete',
        })
        .expect(400);

      expect(body.message).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            constraints: {
              whitelistValidation: expect.stringContaining('property $mongoInjectionTry should not exist'),
            },
          }),
        ]),
      );
    });

    test('Checkout should close cart for changes', async () => {
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
      const { addCartResponse, productResponses } = await createCartWithProducts([product1]);

      await request(app.getHttpServer())
        // Checkout
        .post(`/cart/${addCartResponse.body.id}/checkout`)
        .send({
          currency: 'PLN',
        })
        .expect(201);

      // THEN
      const addProductResponse = await request(app.getHttpServer())
        // Add a product
        .post(`/cart/${addCartResponse.body.id}/product`)
        .send(product2)
        .expect(409);

      const removeProductResponse = await request(app.getHttpServer())
        // delete a product
        .delete(`/cart/${addCartResponse.body.id}/product/${productResponses[0].body.id}`)
        .expect(409);

      expect(addProductResponse.body).toEqual(expect.objectContaining({
        message: expect.stringContaining('The cart is already paid'),
      }));

      expect(removeProductResponse.body).toEqual(expect.objectContaining({
        message: expect.stringContaining('The cart is already paid'),
      }));
    });
  });
});
