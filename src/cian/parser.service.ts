import { Injectable } from '@nestjs/common';
import { startBrowser } from './browser';
import { CianParserService } from './parsers/cian.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { AvitoParserService } from './parsers/avito.service';
import { DataObject } from './parsers/types';

@Injectable()
export class ParserService {
  constructor(
    private sequelizeService: SequelizeService,
    private cianObject: CianParserService,
    private avitoObject: AvitoParserService,
  ) {}

  async scrapeList(url: string, requestId: number, limit: number) {
    let browserInstance = await startBrowser();
    try {
      const scrapedData = [];
      let service: CianParserService | AvitoParserService;

      if (url.includes('cian')) {
        service = this.cianObject;
      } else if (url.includes('avito')) {
        service = this.avitoObject;
      } else {
        throw new Error('Unknown service');
      }

      const data = await service.scraper(browserInstance, url, limit);
      scrapedData.push(...data);
      const result = scrapedData.map((item) => {
        return {
          ...item,
          requestId,
        };
      });
      browserInstance.close();
      await this.sequelizeService.addFlats(result);
    } catch (err) {
      console.log('Could not resolve the browser instance => ', err);
    }
  }
}
