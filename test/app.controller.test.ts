import { expect } from '@jest/globals';
import { End2EndModule } from './e2e.module';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import { HttpStatus } from '@nestjs/common';

const testModule = new End2EndModule({
  imports: [
    {
      module: AppModule,
      providers: [],
    },
  ],
});

describe('app.controller test', () => {
  beforeAll(async () => {
    await testModule.beforeAll();
  });

  afterAll(async () => {
    await testModule.afterAll();
  });

  it('/health (GET)', () => {
    return request(testModule.app.getHttpServer())
      .get('/health')
      .expect(HttpStatus.OK)
      .expect((res) => {
        expect(res.body).toEqual({
          status: 'ok',
          info: {
            '1.1.1.1': {
              status: 'up',
            },
          },
          error: {},
          details: {
            '1.1.1.1': {
              status: 'up',
            },
          },
        });
      });
  });
});
