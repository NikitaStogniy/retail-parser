import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SequelizeService } from '../sequelize/sequelize.service'; // Замените на правильный путь
import { UserPlan } from 'src/sequelize/models/userPlan.model';
import { AuthGuard } from '../auth/auth.guard'; // Добавьте это
import { User } from 'src/sequelize/models/user.model';

@Injectable()
export class UserService {
  constructor(
    private sequelizeService: SequelizeService,
    private authGuard: AuthGuard, // Добавьте это
  ) {}

  async getUserByEmail(email: string) {
    const user = await this.sequelizeService.getUserByEmail(email);
    return user;
  }

  async getUserByToken(token: string) {
    const email = await this.authGuard.getEmailFromToken(token);
    const user = await this.sequelizeService.getUserByEmail(email);
    return user as User;
  }

  async checkPlan(token: string) {
    // const email = await this.authGuard.getEmailFromToken(token);
    // const user = await this.sequelizeService.getUserByEmail(email);
    // if (!user) {
    //   throw new UnauthorizedException();
    // }
    // const plan = (await this.sequelizeService.getPlan(user.id)) as UserPlan;

    return true;
  }

  async getUserById(id: number) {
    const user = await this.sequelizeService.getUserById(id);
    return user;
  }

  async deleteUser(id: number) {
    const user = await this.sequelizeService.deleteUser(id);
    return user;
  }
}
