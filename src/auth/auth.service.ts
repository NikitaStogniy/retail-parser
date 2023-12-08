import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/sequelize/models/user.model';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { SequelizeService } from 'src/sequelize/sequelize.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    private sequelizeService: SequelizeService,
  ) {}

  async signIn(email: string, pass: string): Promise<{ access_token: string }> {
    const user = (await this.usersService.getUserByEmail(email)) as User;
    if (user?.password !== pass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    createUserDto: CreateUserDto,
  ): Promise<{ access_token: string }> {
    const userExists = await this.usersService.getUserByEmail(
      createUserDto.email,
    );

    if (userExists) {
      throw new UnauthorizedException('User already exists');
    }

    const newUser = (await this.sequelizeService.createUser(
      createUserDto,
    )) as User;

    const payload = { sub: newUser.id, email: newUser.email };
    const access_token = await this.jwtService.signAsync(payload);

    return {
      access_token: access_token,
    };
  }
}
