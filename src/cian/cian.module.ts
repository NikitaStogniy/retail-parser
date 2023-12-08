import { Module } from '@nestjs/common';
import { CianController } from './cian.controller';
import { CianService } from './cian.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { ScraperListObject } from './parsers/list.service';
import { ScraperPageObject } from './parsers/page.service';

@Module({
  imports: [SequelizeModule],
  controllers: [CianController],
  providers: [
    CianService,
    SequelizeService,
    ScraperListObject,
    ScraperPageObject,
  ],
})
export class CianModule {}
