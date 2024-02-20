import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import serverlessExpress from '@codegenie/serverless-express';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Callback,
  Context,
  Handler,
} from 'aws-lambda';
import { AppModule } from './app.module';
import {
  BadRequestException,
  LoggerService,
  ValidationPipe,
} from '@nestjs/common';
import { Logger } from '@aws-lambda-powertools/logger';
import { join } from 'path';
import { handlebars } from 'hbs';
import * as fs from 'fs';

export class PowertoolsLoggerService implements LoggerService {
  private logger: Logger;

  constructor() {
    this.logger = new Logger({ serviceName: process.env.SERVICE_NAME });
  }

  log(message: string | object, context?: string): void {
    this.logger.info(this.formatMessage(message, context));
  }

  error(message: string | object, trace?: string, context?: string): void {
    this.logger.error(this.formatMessage(message, context), { trace });
  }

  warn(message: string | object, context?: string): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  debug(message: string | object, context?: string): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  verbose(message: string | object, context?: string): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  private formatMessage(message: string | object, context?: string): string {
    if (typeof message === 'string') {
      return context ? `${context}: ${message}` : message;
    } else {
      return JSON.stringify({ context, ...message });
    }
  }
}

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      {
        logger: new PowertoolsLoggerService(),
      },
    );
    nestApp.setViewEngine('hbs');
    nestApp.setBaseViewsDir(join(__dirname, 'views'));
    nestApp.engine(
      'hbs',
      (
        filePath: string,
        options: Record<string, object>,
        callback: (err: Error | null, rendered?: string) => void,
      ) => {
        const template = handlebars.compile(fs.readFileSync(filePath, 'utf8'));
        const result = template(options);
        callback(null, result);
      },
    );

    nestApp.enableCors();
    nestApp.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
          const messages = errors.map((error) => ({
            property: error.property,
            constraints: error.constraints,
          }));
          return new BadRequestException(messages);
        },
      }),
    );

    await nestApp.init();

    cachedServer = serverlessExpress({
      app: nestApp.getHttpAdapter().getInstance(),
    });
  }

  return cachedServer;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Callback<APIGatewayProxyResult>,
) => {
  const server = await bootstrap();
  return server(event, context, callback);
};
