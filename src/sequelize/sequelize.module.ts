import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { User } from './models/user.model';
import { Requests } from './models/requests.model';
import { Plan } from './models/plan.model';
import { SequelizeService } from './sequelize.service';
import { UserPlan } from './models/userPlan.model';
import { Property } from './models/property.model';
import { Cluster1 } from './models/cluster1.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: '45.141.184.80',
        port: 3432,
        username: 'postgres',
        password: 'Gfhjkmkmkhu!#7',
        database: 'railway',
        models: [User, Requests, Plan, UserPlan, Property, Cluster1],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [SequelizeService],
  exports: [SequelizeService],
})
export class SequelizeConfigModule {}
