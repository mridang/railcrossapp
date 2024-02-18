import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import * as expressHandlebars from 'express-handlebars';
import {BadRequestException, ValidationPipe} from "@nestjs/common";


async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.engine('hbs', expressHandlebars.create({
        defaultLayout: 'main',
        extname: '.hbs',
        partialsDir: ['views/partials/'],
    }).engine);
    app.set('view engine', 'hbs');
    app.set('views', join(__dirname, '..', 'views'));

    app.useGlobalPipes(new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
        transformOptions: {
            enableImplicitConversion: true,
        },
        exceptionFactory: (errors) => {
            const messages = errors.map(error => ({
                property: error.property,
                constraints: error.constraints,
            }));
            return new BadRequestException(messages);
        },
    }));

    await app.listen(3000);
}

bootstrap();
