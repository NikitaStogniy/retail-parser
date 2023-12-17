// demand.service.ts
import { Injectable } from '@nestjs/common';
import { ParserService } from '../cian/parser.service';
import { SequelizeService } from '../sequelize/sequelize.service';
import { RequestDto } from './dto/request.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('demand')
@Injectable()
export class DemandService {
  constructor(
    private readonly cianService: ParserService,
    private readonly sequelizeService: SequelizeService,
  ) {}

  async parse(requestDto: RequestDto) {
    const request = {
      name: requestDto.name,
      url: requestDto.url,
      status: 'processing',
      limit: requestDto.limit,
    };

    const { id: requestId } = await this.sequelizeService.addRequest({
      ...request,
    });

    this.cianService.scrapeList(request.url, requestId, request.limit);
    return { message: 'Request is being processed', id: requestId };
  }

  async getRequest(id: number) {
    const request = await this.sequelizeService.getRequest(id);
    return request;
  }

  async deleteRequest(id: number) {
    const request = await this.sequelizeService.deleteRequest(id);
    return request;
  }

  async updateRequest(id: number, status: string) {
    const request = await this.sequelizeService.updateRequest(id, status);
    return request;
  }
}
