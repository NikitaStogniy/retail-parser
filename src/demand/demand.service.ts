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

    this.cianService.scrapeList(request.url, request.limit);
    return { message: 'Request is being processed' };
  }
}
