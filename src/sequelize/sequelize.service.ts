import { Injectable } from '@nestjs/common';
import { Sequelize } from 'sequelize-typescript';
import { Requests } from './models/requests.model';
import { Cluster1 } from './models/cluster1.model';
import { Cluster2 } from './models/cluster2.model';
import { Cluster3 } from './models/cluster3.model';
import { Plan } from './models/plan.model';
import { User } from './models/user.model';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { RequestDto } from 'src/demand/dto/request.dto';
import { ApiTags } from '@nestjs/swagger';
import { PropertyDto } from 'src/demand/dto/property.dto';
import { Cluster1Dto } from 'src/demand/dto/cluster1.dto';
import { Property } from './models/property.model';

@ApiTags('sequelize')
@Injectable()
export class SequelizeService {
  constructor(private readonly sequelize: Sequelize) {}

  async onModuleInit() {
    await this.sequelize.sync();
  }

  async addClusters(values: Cluster1Dto[]) {
    try {
      const clusters = await Cluster1.bulkCreate(values);
      return clusters;
    } catch (error) {
      console.error(`Ошибка при добавлении кластеров: ${error}`);
      throw error;
    }
  }

  async addClusters2(values: Cluster1Dto[]) {
    try {
      const clusters = await Cluster2.bulkCreate(values);
      return clusters;
    } catch (error) {
      console.error(`Ошибка при добавлении кластеров: ${error}`);
      throw error;
    }
  }

  async addClusters3(values: Cluster1Dto[]) {
    try {
      const clusters = await Cluster3.bulkCreate(values);
      return clusters;
    } catch (error) {
      console.error(`Ошибка при добавлении кластеров: ${error}`);
      throw error;
    }
  }

  async getUserByEmail(email: string) {
    try {
      const user = await this.sequelize.model('User').findOne({
        where: { email },
      });
      return user;
    } catch (error) {
      console.error(`Ошибка при получении пользователя по email: ${error}`);
      throw error;
    }
  }
  async getUserByToken(token: string) {
    try {
      const user = await this.sequelize.model('User').findOne({
        where: { access_token: token },
      });
      return user;
    } catch (error) {
      console.error(`Ошибка при получении пользователя по токену: ${error}`);
      throw error;
    }
  }

  async getPlan(userId: number) {
    try {
      const plan = await this.sequelize.model('UserPlan').findOne({
        where: { UserId: userId },
      });
      return plan;
    } catch (error) {
      console.error(`Ошибка при получении плана: ${error}`);
      throw error;
    }
  }
  async getUserById(id: number) {
    try {
      const user = await this.sequelize.model('User').findByPk(id);
      return user;
    } catch (error) {
      console.error(`Ошибка при получении пользователя по ID: ${error}`);
      throw error;
    }
  }

  async updateUser(user: User) {
    try {
      await user.save();
      return user;
    } catch (error) {
      console.error(`Ошибка при обновлении пользователя: ${error}`);
      throw error;
    }
  }

  async deleteUser(id: number) {
    try {
      const user = await this.sequelize.model('User').findByPk(id);
      if (user) {
        await user.destroy();
      }
      return user;
    } catch (error) {
      console.error(`Ошибка при удалении пользователя: ${error}`);
      throw error;
    }
  }

  async createUser(user: CreateUserDto) {
    try {
      const newUser = await this.sequelize.model('User').create(user as any);
      return newUser;
    } catch (error) {
      console.error(`Ошибка при создании пользователя: ${error}`);
      throw error;
    }
  }

  async addRequest(request: RequestDto) {
    try {
      const newRequest = await this.sequelize
        .model('Requests')
        .create(request as any);
      return newRequest;
    } catch (error) {
      console.error(`Ошибка при добавлении запроса: ${error}`);
      throw error;
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
      throw error;
    }
  }
  async getRequest(id: number) {
    try {
      const request = await Requests.findByPk(id);
      return request;
    } catch (error) {
      console.error(`Ошибка при получении запроса: ${error}`);
      throw error;
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
      throw error;
    }
  }

  async getPlanById(id: number) {
    try {
      const plan = await Plan.findByPk(id);
      return plan;
    } catch (error) {
      console.error(`Ошибка при получении плана по ID: ${error}`);
      throw error;
    }
  }

  async deleteRequestsByUserId(userId: number) {
    try {
      const requests = await Requests.destroy({ where: { userId } });
      return requests;
    } catch (error) {
      console.error(
        `Ошибка при удалении запросов по ID пользователя: ${error}`,
      );
      throw error;
    }
  }

  async getRequestsByUserId(userId: number) {
    try {
      const requests = await Requests.findAll({ where: { userId } });
      return requests;
    } catch (error) {
      console.error(
        `Ошибка при получении запросов по ID пользователя: ${error}`,
      );
      throw error;
    }
  }
  async addFlats(values: PropertyDto[]) {
    try {
      const flats = await Property.bulkCreate(values, {
        ignoreDuplicates: true,
      });
      return flats;
    } catch (error) {
      console.error(`Ошибка при добавлении квартир: ${error}`);
      throw error;
    }
  }
}
