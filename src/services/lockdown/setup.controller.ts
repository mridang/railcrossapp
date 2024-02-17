import {Controller, Get} from '@nestjs/common';

@Controller('setup')
export class SetupController {

    @Get("/")
    async getHello(): Promise<string> {
        return 'ok';
    }
}
