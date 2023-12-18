import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { DemandService } from './demand.service';
import { RequestDto } from './dto/request.dto';

@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Post('parse')
  async parse(@Body() requestDto: RequestDto) {
    return this.demandService.parse(requestDto);
  }

  @Put('updateRequest/:id')
  async updateRequest(@Param('id') id: number, @Body('status') status: string) {
    return this.demandService.updateRequest(id, status);
  }

  @Delete('deleteRequest/:id')
  async deleteRequest(@Param('id') id: number) {
    return this.demandService.deleteRequest(id);
  }

  @Get('request/:id')
  async getRequest(@Param('id') id: number) {
    return this.demandService.getRequest(id);
  }

  @Get('requests')
  async getAllRequests() {
    return this.demandService.getAllRequests();
  }
}
