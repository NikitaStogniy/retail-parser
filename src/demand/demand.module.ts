import { Module } from '@nestjs/common';
import { ParserService } from '../cian/parser.service';
import { DemandController } from './demand.controller';
import { DemandService } from './demand.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { SequelizeConfigModule } from 'src/sequelize/sequelize.module';
import { CianParserService } from 'src/cian/parsers/cian.service';
import { AvitoParserService } from 'src/cian/parsers/avito.service';

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
