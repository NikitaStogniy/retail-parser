import { Module } from '@nestjs/common';
import { ParserService } from '../parser/parser.service';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { SequelizeConfigModule } from 'src/sequelize/sequelize.module';
import { CianParserService } from 'src/parser/parsers/cian.service';
import { AvitoParserService } from 'src/parser/parsers/avito.service';

@Module({
  imports: [SequelizeConfigModule],
  controllers: [DemandController],
  providers: [
    ParserService,
    DemandService,
    SequelizeService,
    CianParserService,
    AvitoParserService,
  ],
})
export class DemandModule {}
