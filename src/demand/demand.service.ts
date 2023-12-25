// demand.service.ts
import { Injectable } from '@nestjs/common';
import { ParserService } from '../parser/parser.service';
import { SequelizeService } from '../sequelize/sequelize.service';
import { RequestDto } from './dto/request.dto';
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

    if (!request.url || !request.limit || !request.name) {
      return { message: 'Request is not valid' };
    }

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

  async getAllRequests() {
    const requests = await this.sequelizeService.getAllRequests();
    return requests;
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
