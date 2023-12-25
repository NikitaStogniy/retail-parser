import { Module } from '@nestjs/common';
import { DemandModule } from './demand/demand.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { ParsernModule } from './parser/parser.module';
import { BotworkerService } from './botworker/botworker.service';
import { ConfigModule } from '@nestjs/config';
import { SequelizeService } from './sequelize/sequelize.service';
import { ParserService } from './parser/parser.service';
import { CianParserService } from './parser/parsers/cian.service';

import { BotworkerModule } from './botworker/botworker.module';
import { CianUnpublishedParserService } from './parser/parsers/cianUnpublished.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    SequelizeModule,
    DemandModule,
    ParsernModule,
    BotworkerModule,
  ],
  controllers: [],
  providers: [
    SequelizeService,
    ParserService,
    BotworkerService,
    CianParserService,
    CianUnpublishedParserService,
  ],
  exports: [SequelizeService, ParserService],
})
export class AppModule {}
