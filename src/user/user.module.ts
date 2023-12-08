import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { SequelizeConfigModule } from '../sequelize/sequelize.module';
import { AuthModule } from 'src/auth/auth.module';
import { forwardRef } from '@nestjs/common';
//...
@Module({
  imports: [SequelizeConfigModule, forwardRef(() => AuthModule)],
  providers: [UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UserModule {}
