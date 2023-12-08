import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { DemandModule } from './demand/demand.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { UserModule } from './user/user.module';
import { CianModule } from './cian/cian.module';
import { AvitoModule } from './avito/avito.module';
import { BotController } from './bot/bot.controller';
import { BotModule } from './bot/bot.module';

@Module({
  imports: [
    DemandModule,
    AuthModule,
    SequelizeModule,
    UserModule,
    CianModule,
    AvitoModule,
    BotModule,
  ],
  controllers: [],
})
export class AppModule {}
