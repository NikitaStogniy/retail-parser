import { SequelizeModule } from '@nestjs/sequelize';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { Requests } from './models/requests.model';
import { SequelizeService } from './sequelize.service';
import { Property } from './models/property.model';

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        dialect: 'postgres',
        host: 'localhost',
        port: 5432,
        username: 'postgres',
        password: 'postgres',
        database: 'mydatabase',
        models: [Requests, Property],
        autoLoadModels: true,
        synchronize: true,
      }),
    }),
  ],
  providers: [SequelizeService],
  exports: [SequelizeService],
})
export class SequelizeConfigModule {}
