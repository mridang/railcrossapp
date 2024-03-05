import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { handlebars } from 'hbs';
import fs from 'fs';
import helmet from 'helmet';

async function bootstrap() {
  const nestApp = await NestFactory.create<NestExpressApplication>(AppModule, {
    rawBody: true,
  });
  nestApp.setViewEngine('hbs');
  nestApp.setBaseViewsDir(join(__dirname, '..', 'views'));
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
  await nestApp.listen(3000);
}

// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap().then(() => {
  console.log('\x07');
});
