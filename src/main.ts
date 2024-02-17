import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {NestExpressApplication} from '@nestjs/platform-express';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    //app.setViewEngine('hbs');
    //app.setBaseViewsDir(__dirname + '/src/views');
    //hbs.registerPartials(__dirname + '/views/partials');
    await app.listen(3000);
}

bootstrap();
