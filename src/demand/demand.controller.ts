import { Controller, Post, Body } from '@nestjs/common';
import { DemandService } from './demand.service';
import { RequestDto } from './dto/request.dto';

@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Post('parse')
  async parse(@Body() requestDto: RequestDto) {
    return this.demandService.parse(requestDto);
  }
}
