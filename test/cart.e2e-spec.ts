import * as request from 'supertest';
import { Connection } from 'typeorm';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

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
});
