import { Injectable } from '@nestjs/common';
import { startBrowser } from './browser';
import { CianParserService } from './parsers/cian.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
// import { AvitoParserService } from './parsers/avito.service';
import { DataObject } from './parsers/types';
import { ClusterDto } from 'src/demand/dto/cluster.dto';
import { CianUnpublishedParserService } from './parsers/cianUnpublished.service';

@Injectable()
export class ParserService {
  constructor(
    private sequelizeService: SequelizeService,
    private cianObject: CianParserService,
    private unpublishObject: CianUnpublishedParserService,
    // private avitoObject: AvitoParserService,
  ) {}

  async scrapeUnpublished(url: string) {
    let browserInstance = await startBrowser();
    try {
      let service: CianUnpublishedParserService;
      service = this.unpublishObject;
      const data = await service.scraper(browserInstance, url);
      browserInstance.close();
      return data;
    } catch (err) {
      browserInstance.close();
      console.log('Could not resolve the browser instance => ', err);
    } finally {
      if (browserInstance) {
        browserInstance.close();
      }
    }
  }
  async scrapeList(url: string) {
    let browserInstance = await startBrowser();
    try {
      const scrapedData = [];
      let service: CianParserService;

      if (url.includes('cian')) {
        service = this.cianObject;
      } else if (url.includes('avito')) {
        // service = this.avitoObject;
        throw new Error('Avito service is not implemented');
      } else {
        throw new Error('Unknown service');
      }

      const data = await service.scraper(browserInstance, url);
      scrapedData.push(...data);
      const result = scrapedData.map((item) => {
        return {
          ...item,
        };
      });

      browserInstance.close();
      return result;
    } catch (err) {
      browserInstance.close();
      console.log('Could not resolve the browser instance => ', err);
      throw err;
    } finally {
      if (browserInstance) {
        browserInstance.close();
      }
    }
  }
}
