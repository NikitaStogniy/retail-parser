import { Module } from '@nestjs/common';
import { ParserService } from './parser.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { CianParserService } from './parsers/cian.service';
import { AvitoParserService } from './parsers/avito.service';

@Module({
  imports: [SequelizeModule],
  providers: [
    SequelizeService,
    ParserService,
    CianParserService,
    AvitoParserService,
  ],
})
export class ParsernModule {}
