import { Module } from '@nestjs/common';
import { ParserService } from '../parser/parser.service';
import { DemandController } from 'src/demand/demand.controller';
import { DemandService } from 'src/demand/demand.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { SequelizeConfigModule } from 'src/sequelize/sequelize.module';
import { CianParserService } from 'src/parser/parsers/cian.service';
import { CianUnpublishedParserService } from 'src/parser/parsers/cianUnpublished.service';

@Module({
  imports: [SequelizeConfigModule],
  controllers: [DemandController],
  providers: [
    ParserService,
    DemandService,
    SequelizeService,
    CianParserService,
    CianUnpublishedParserService,
    // AvitoParserService,
  ],
})
export class BotworkerModule {}
