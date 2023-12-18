import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Requests } from './models/requests.model';
import { RequestDto } from 'src/demand/dto/request.dto';
import { PropertyDto } from 'src/demand/dto/property.dto';
import { Property } from './models/property.model';

@Injectable()
export class SequelizeService {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    await this.sequelize.sync();
  }
  async addRequest(request: RequestDto) {
    try {
      const newRequest = await this.sequelize
        .model('Requests')
        .create(request as any);
      return newRequest;
    } catch (error) {
      console.error(`Ошибка при добавлении запроса: ${error}`);
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async updateRequest(id: number, status: string) {
    try {
      const request = await Requests.findByPk(id);
      if (request) {
        request.status = status;
        await request.save();
      }
      return request;
    } catch (error) {
      console.error(`Ошибка при обновлении запроса: ${error}`);
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getAllRequests() {
    try {
      const requests = await Requests.findAll();
      return requests;
    } catch (error) {
      console.error(`Ошибка при получении запросов: ${error}`);
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async getRequest(id: number) {
    try {
      const request = await Requests.findByPk(id);
      if (request.status === 'done') {
        const property = await Property.findAll({ where: { requestId: id } });
        return property;
      } else {
        return request;
      }
    } catch (error) {
      console.error(`Ошибка при получении запроса: ${error}`);
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async deleteRequest(id: number) {
    try {
      const request = await Requests.findByPk(id);
      if (request) {
        await request.destroy();
      }
      return request;
    } catch (error) {
      console.error(`Ошибка при удалении запроса: ${error}`);
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  async addFlats(values: PropertyDto[]) {
    if (!values.length) {
      throw new Error('Массив значений пуст');
    }

    const requestId = values[0].requestId;

    try {
      await Property.bulkCreate(values, {
        ignoreDuplicates: true,
      });

      return await this.updateRequest(requestId, 'done');
    } catch (error) {
      console.error(`Ошибка при добавлении квартир: ${error}`);
      await this.updateRequest(requestId, 'error');
      throw new HttpException(
        'Ошибка на сервере',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
