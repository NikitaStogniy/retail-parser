import { Module } from '@nestjs/common';
import { DemandModule } from './demand/demand.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ParsernModule } from './parser/parser.module';
import { ConfigModule } from '@nestjs/config';
import { SequelizeService } from './sequelize/sequelize.service';
import { ParserService } from './parser/parser.service';
import { CianParserService } from './parser/parsers/cian.service';

import { CianUnpublishedParserService } from './parser/parsers/cianUnpublished.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule,
    DemandModule,
    ParsernModule,
  ],
  controllers: [],
  providers: [
    SequelizeService,
    ParserService,
    CianParserService,
    CianUnpublishedParserService,
  ],
  exports: [SequelizeService, ParserService],
})
export class AppModule {}
