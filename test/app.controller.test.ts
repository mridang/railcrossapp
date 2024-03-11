import { End2EndModule } from './e2e.module';
import { AppModule } from '../src/app.module';
import request from 'supertest';
import {
  Controller,
  Get,
  HttpStatus,
  InternalServerErrorException,
} from '@nestjs/common';

@Controller()
class DynamicController {
  @Get('500')
  get500() {
    throw new Error('500 error');
  }

  @Get('error')
  getError() {
    throw new InternalServerErrorException('General error');
  }
}

const testModule = new End2EndModule({
  imports: [
    {
      module: AppModule,
      controllers: [DynamicController],
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
      .expect({
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

  it('/404 (GET)', async () => {
    await request(testModule.app.getHttpServer())
      .get('/404')
      .set('Accept', 'text/html')
      .expect(HttpStatus.NOT_FOUND)
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect((response) => {
        if (!response.text.includes('<title>Not Found</title>')) {
          throw new Error('Expected text not found in response');
        }
      });
  });

  it('/500 (GET)', async () => {
    await request(testModule.app.getHttpServer())
      .get('/500')
      .set('Accept', 'text/html')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect((response) => {
        if (!response.text.includes('<title>Internal server error</title>')) {
          throw new Error('Expected text not found in response');
        }
      });
  });

  it('/error (GET)', async () => {
    await request(testModule.app.getHttpServer())
      .get('/error')
      .set('Accept', 'text/html')
      .expect(HttpStatus.INTERNAL_SERVER_ERROR)
      .expect('Content-Type', 'text/html; charset=UTF-8')
      .expect((response) => {
        if (!response.text.includes('<title>Internal server error</title>')) {
          throw new Error('Expected text not found in response');
        }
      });
  });
});
