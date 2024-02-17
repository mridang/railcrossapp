import {Controller, Get} from '@nestjs/common';

@Controller('status')
export class AppController {

    @Get("/")
    async getHello(): Promise<string> {
        return 'ok';
    }
}
