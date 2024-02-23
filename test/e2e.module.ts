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
import { Test } from '@nestjs/testing';

export class End2EndModule {
  app!: INestApplication;
  private readonly imports: Array<
    Type | DynamicModule | Promise<DynamicModule> | ForwardReference
  >;
  private readonly providers: Provider[];

  constructor(options: {
    imports?: Array<
      Type | DynamicModule | Promise<DynamicModule> | ForwardReference
    >;
    providers?: Provider[];
  }) {
    this.imports = options.imports ?? [];
    this.providers = options.providers ?? [];
  }

  async beforeAll(): Promise<void> {
    const moduleFixture = await Test.createTestingModule({
      imports: [...this.imports],
      providers: [...this.providers],
    })
      .setLogger(new Logger()) // See https://stackoverflow.com/questions/71677866/
      .compile();

    const app = moduleFixture.createNestApplication<NestExpressApplication>({
      rawBody: true,
    });
    app.setBaseViewsDir(join(__dirname, '..', 'views'));
    app.setViewEngine('hbs');

    await app.init();

    this.app = app;
  }

  async afterAll(): Promise<void> {
    await this.app.close();
  }
}
