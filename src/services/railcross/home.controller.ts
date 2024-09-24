import { Controller, Get, Logger, Render } from '@nestjs/common';

@Controller()
export class HomeController {
  private readonly logger = new Logger(HomeController.name);

  @Get()
  @Render('home')
  async getIndex() {
    return {
      //
    };
  }
}
