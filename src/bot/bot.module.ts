import { Module } from '@nestjs/common';
import { BotService } from './bot.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { Cluster1 } from 'src/sequelize/models/cluster1.model';
import { Property } from 'src/sequelize/models/property.model';
import { BotController } from './bot.controller';
import { Cluster2 } from 'src/sequelize/models/cluster2.model';
import { Cluster3 } from 'src/sequelize/models/cluster3.model';

@Module({
  imports: [
    SequelizeModule.forFeature([Property, Cluster1, Cluster2, Cluster3]),
  ],
  providers: [BotService, SequelizeService],
  controllers: [BotController],
  exports: [BotService],
})
export class BotModule {}
