import { Module } from '@nestjs/common';
import { DemandModule } from './demand/demand.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ParsernModule } from './cian/parser.module';
@Module({
  imports: [SequelizeModule, DemandModule, ParsernModule],
  controllers: [],
})
export class AppModule {}
