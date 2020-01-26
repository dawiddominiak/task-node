import * as request from 'supertest';

import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';

import { AppModule } from '../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
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
  });
});
