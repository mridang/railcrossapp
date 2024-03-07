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
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { join } from 'path';
import { handlebars } from 'hbs';
import * as fs from 'fs';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { PowertoolsLoggerService } from './app.logger';

let cachedServer: Handler;

async function bootstrap() {
  if (!cachedServer) {
    const nestApp = await NestFactory.create<NestExpressApplication>(
      AppModule,
      {
        logger: new PowertoolsLoggerService(),
        rawBody: true,
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

    nestApp.use(cookieParser());
    nestApp.use(helmet());
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
