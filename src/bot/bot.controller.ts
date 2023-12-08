import { Controller, Get } from '@nestjs/common';
import { BotService } from './bot.service';

@Controller('bot')
export class BotController {
  constructor(private botService: BotService) {}

  @Get('/bestproperty')
  bestProperty() {
    return this.botService.findBestProperty();
  }
}
