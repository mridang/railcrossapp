import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';
import {join} from 'path';
import {BadRequestException, ValidationPipe} from '@nestjs/common';
import {handlebars} from "hbs";
import fs from "fs";

async function bootstrap() {
    const nestApp = await NestFactory.create<NestExpressApplication>(AppModule);
    nestApp.setViewEngine('hbs');
    nestApp.setBaseViewsDir(join(__dirname, '..', 'views'));
    nestApp.engine('hbs', (filePath: string, options: Record<string, any>, callback: (err: Error | null, rendered?: string) => void) => {
        const template = handlebars.compile(fs.readFileSync(filePath, 'utf8'));
        const result = template(options);
        callback(null, result);
    });

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

bootstrap().then(d => {
    console.log(d)
});
