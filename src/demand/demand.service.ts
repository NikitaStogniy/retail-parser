// demand.service.ts
import { Injectable } from '@nestjs/common';
import { CianService } from '../cian/cian.service';
import { SequelizeService } from '../sequelize/sequelize.service';
import { RequestDto } from './dto/request.dto';
import { ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { User } from 'src/sequelize/models/user.model';
import { Plan } from 'src/sequelize/models/plan.model';
import { UserPlan } from 'src/sequelize/models/userPlan.model';
import { UserService } from 'src/user/user.service';

@ApiTags('demand')
@Injectable()
export class DemandService {
  constructor(
    private readonly cianService: CianService,
    private readonly sequelizeService: SequelizeService,
    private readonly userService: UserService,
  ) {}

  async parse(requestDto: RequestDto, authorization: string) {
    const request = {
      name: requestDto.name,
      url: requestDto.url,
      status: 'processing',
      limit: requestDto.limit,
    };
    const user = (await this.userService.getUserByToken(authorization)) as User;
    if (!this.userService.checkPlan(authorization)) {
      return 'User plan is expired or usage limit is reached';
    }

    const { id: requestId } = await this.sequelizeService.addRequest({
      ...request,
      userId: user.id,
    });
    if (request.url.includes('cian')) {
      this.cianService.scrapeListCian(request.url, requestId, request.limit);
    } else {
      return { message: 'Wrong URL', status: 'error' };
    }
    return { message: 'Request is being processed', id: requestId };
  }

  async fastparse(requestDto: RequestDto, authorization: string) {
    const request = {
      name: requestDto.name,
      url: requestDto.url,
      status: 'processing',
      limit: requestDto.limit,
    };

    if (!this.userService.checkPlan(authorization)) {
      return 'User plan is expired or usage limit is reached';
    }

    const user = (await this.userService.getUserByToken(authorization)) as User;
    if (!this.userService.checkPlan(authorization)) {
      return 'User plan is expired or usage limit is reached';
    }

    const { id: requestId } = await this.sequelizeService.addRequest({
      ...request,
      userId: user.id,
    });

    if (request.url.includes('cian')) {
      this.cianService.scrapePageCian(request.url, requestId, request.limit);
    } else {
      return { message: 'Wrong URL', status: 'error' };
    }
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

  async deleteRequestsByUserId(userId: number) {
    const requests = await this.sequelizeService.deleteRequestsByUserId(userId);
    return requests;
  }

  async updateRequest(id: number, status: string) {
    const request = await this.sequelizeService.updateRequest(id, status);
    return request;
  }

  async getRequestsByUserId(userId: number) {
    const requests = await this.sequelizeService.getRequestsByUserId(userId);
    return requests;
  }
}
