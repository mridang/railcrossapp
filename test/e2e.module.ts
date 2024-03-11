import {
  type DynamicModule,
  type ForwardReference,
  type INestApplication,
  Logger,
  type Provider,
  type Type,
} from '@nestjs/common';
import { join } from 'path';
import { type NestExpressApplication } from '@nestjs/platform-express';
import { Test, TestingModuleBuilder } from '@nestjs/testing';
import { CustomHttpExceptionFilter } from '../src/errorpage.exception.filter';

export class End2EndModule {
  app!: INestApplication;
  private readonly imports: Array<
    Type | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  private readonly controllers: Type[];
  private readonly providers: Provider[];

  constructor(options: {
    imports?: Array<
      Type | DynamicModule | Promise<DynamicModule> | ForwardReference
    >;
    providers?: Provider[];
    controllers?: Type[];
  }) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.imports = options.imports ?? [];
    this.providers = options.providers ?? [];
    this.controllers = options.controllers ?? [];
  }

  async beforeAll(
    testFn: (testModule: TestingModuleBuilder) => TestingModuleBuilder = (
      testModule,
    ) => testModule,
  ): Promise<void> {
    const moduleFixture = await testFn(
      Test.createTestingModule({
        controllers: [...this.controllers],
        imports: [...this.imports],
        providers: [...this.providers],
      }).setLogger(new Logger()), // See https://stackoverflow.com/questions/71677866/
    ).compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>({
      rawBody: true,
    });
    app.useGlobalFilters(new CustomHttpExceptionFilter());
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.init();

    this.app = app;
  }

  async afterAll(): Promise<void> {
    await this.app.close();
  }
}
