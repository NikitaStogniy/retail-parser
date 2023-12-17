import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Body,
  Param,
} from '@nestjs/common';
import { ApiOperation, ApiTags, ApiResponse } from '@nestjs/swagger';
import { DemandService } from './demand.service';
import { RequestDto } from './dto/request.dto';

@ApiTags('Demand')
@Controller('demand')
export class DemandController {
  constructor(private readonly demandService: DemandService) {}

  @Post('parse')
  @ApiOperation({ summary: 'Handle new request' })
  @ApiResponse({
    status: 201,
    description: 'The request has been successfully created.',
  })
  async parse(@Body() requestDto: RequestDto) {
    return this.demandService.parse(requestDto);
  }

  @Put('updateRequest/:id')
  @ApiOperation({ summary: 'Update request' })
  @ApiResponse({
    status: 200,
    description: 'The request has been successfully updated.',
  })
  async updateRequest(@Param('id') id: number, @Body('status') status: string) {
    return this.demandService.updateRequest(id, status);
  }

  @Delete('deleteRequest/:id')
  @ApiOperation({ summary: 'Delete request' })
  @ApiResponse({
    status: 200,
    description: 'The request has been successfully deleted.',
  })
  async deleteRequest(@Param('id') id: number) {
    return this.demandService.deleteRequest(id);
  }

  @Get('request/:id')
  @ApiOperation({ summary: 'Get request' })
  @ApiResponse({
    status: 200,
    description: 'The request has been successfully retrieved.',
  })
  async getRequest(@Param('id') id: number) {
    return this.demandService.getRequest(id);
  }
}
