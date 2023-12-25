import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { SequelizeService } from './sequelize.service';
import { Property } from './models/property.model';
import { Cluster1 } from './models/cluster1.model';
import { Cluster2 } from './models/cluster2.model';
import { Cluster3 } from './models/cluster3.model';
import { Cluster4 } from './models/cluster4.model';
import { Users } from './models/users.model';
import { Shown1 } from './models/shown1.model';
import { Shown2 } from './models/shown2.model';
import { Shown3 } from './models/shown3.model';
import { Shown4 } from './models/shown4.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: 'db',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'mydatabase',
        models: [
          Cluster1,
          Cluster2,
          Cluster3,
          Cluster4,
          Users,
          Shown1,
          Shown2,
          Shown3,
          Shown4,
          Property,
        ],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [SequelizeService],
  exports: [SequelizeService],
})
export class SequelizeConfigModule {}
