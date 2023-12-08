import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { startBrowser } from './browser';
import { ScraperPageObject } from './parsers/page.service';
import { ScraperListObject } from './parsers/list.service';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import { PropertyDto } from 'src/demand/dto/property.dto';
import { Cluster1Dto } from 'src/demand/dto/cluster1.dto';
import { DataObject } from './parsers/types';
import { Cluster2Dto } from 'src/demand/dto/cluster2.dto';
import { Cluster3Dto } from 'src/demand/dto/cluster3.dto';

@ApiTags('cian')
@Injectable()
export class CianService {
  constructor(
    private sequelizeService: SequelizeService,
    private scraperListObject: ScraperListObject,
    private scraperPageObject: ScraperPageObject,
  ) {}

  @ApiOperation({ summary: 'Scrape Cian List' })
  async scrapeListCian(url: string, requestId: number, limit: number) {
    let browserInstance = await startBrowser();
    try {
      const scrapedData: PropertyDto[] = await this.scraperListObject.scraper(
        browserInstance,
        url,
        limit,
      );
      browserInstance.close();
      const cluster: Cluster1Dto[] = await this.clusterising1(scrapedData);
      const cluster2: Cluster1Dto[] = await this.clusterising2(scrapedData);
      const cluster3: Cluster1Dto[] = await this.clusterising3(scrapedData);
      await this.sequelizeService.addFlats(scrapedData);
      await this.sequelizeService.addClusters(await cluster);
      await this.sequelizeService.addClusters2(await cluster2);
      await this.sequelizeService.addClusters3(await cluster3);
    } catch (err) {
      console.log('Could not resolve the browser instance => ', err);
    }
  }
  @ApiOperation({ summary: 'Scrape Cian Page' })
  async scrapePageCian(url: string, requestId: number, limit: number) {
    let browserInstance = await startBrowser();
    try {
      let scrapedData = await this.scraperPageObject.scraper(
        browserInstance,
        url,
        limit,
      );
      browserInstance.close();
      const cluster: Cluster1Dto[] = await this.clusterising1([scrapedData]);
      const cluster2: Cluster1Dto[] = await this.clusterising2([scrapedData]);
      const cluster3: Cluster1Dto[] = await this.clusterising3([scrapedData]);
      await this.sequelizeService.addFlats([scrapedData]);
      await this.sequelizeService.addClusters(await cluster);
      await this.sequelizeService.addClusters2(await cluster2);
      await this.sequelizeService.addClusters3(await cluster3);
    } catch (err) {
      console.log('Could not resolve the browser instance => ', err);
    }
  }

  async clusterising1(dataObj: DataObject[]): Promise<Cluster1Dto[]> {
    const clusters: Cluster1Dto[] = [];

    dataObj.forEach((obj) => {
      let metroCategory: number,
        yearCategory: number,
        roomsCategory: number,
        floorCategory: number,
        renovationCategory: number,
        propid: number;

      propid = obj.propid;
      console.log('footMetro', obj.footMetro);
      if (obj.footMetro <= 15) metroCategory = 1;
      else if (obj.footMetro > 15 && obj.footMetro <= 25) metroCategory = 2;
      else if (obj.footMetro > 25 && obj.footMetro <= 35) metroCategory = 3;
      else if (obj.footMetro > 35 && obj.footMetro <= 45) metroCategory = 4;
      else if (obj.footMetro > 45 && obj.footMetro <= 55) metroCategory = 5;
      else if (obj.footMetro > 55 && obj.footMetro <= 65) metroCategory = 6;
      else if (obj.footMetro > 65 && obj.footMetro <= 75) metroCategory = 7;
      else if (obj.footMetro > 75 && obj.footMetro <= 85) metroCategory = 8;
      else if (obj.footMetro > 85 && obj.footMetro <= 95) metroCategory = 9;
      else metroCategory = 10;

      if (obj.year <= 1924) yearCategory = 1;
      else if (obj.year > 1924 && obj.year <= 1934) yearCategory = 2;
      else if (obj.year > 1934 && obj.year <= 1944) yearCategory = 3;
      else if (obj.year > 1944 && obj.year <= 1954) yearCategory = 4;
      else if (obj.year > 1954 && obj.year <= 1964) yearCategory = 5;
      else if (obj.year > 1964 && obj.year <= 1974) yearCategory = 6;
      else if (obj.year > 1974 && obj.year <= 1984) yearCategory = 7;
      else if (obj.year > 1984 && obj.year <= 1994) yearCategory = 8;
      else if (obj.year > 1994 && obj.year <= 2004) yearCategory = 9;
      else if (obj.year > 2004 && obj.year <= 2014) yearCategory = 10;
      else if (obj.year > 2014 && obj.year <= 2024) yearCategory = 11;
      else yearCategory = 12;

      roomsCategory = obj.rooms;

      if (obj.floor != 1 && obj.floor != obj.totalFloors) floorCategory = 1;
      else if (obj.floor == 1) floorCategory = 2;
      else if (obj.floor == obj.totalFloors) floorCategory = 3;
      else floorCategory = 4;

      if (obj.renovation == 'Без ремонта') renovationCategory = 1;
      else if (obj.renovation == 'Косметический ремонт') renovationCategory = 2;
      else if (obj.renovation == 'Евроремонт') renovationCategory = 3;
      else if (obj.renovation == 'Дизайнерский ремонт') renovationCategory = 4;
      else renovationCategory = 5;

      const cluster1 = new Cluster1Dto();

      cluster1.propertyId = propid;
      cluster1.metroCategory = metroCategory;
      cluster1.yearCategory = yearCategory;
      cluster1.roomsCategory = roomsCategory;
      cluster1.floorCategory = floorCategory;
      cluster1.renovationCategory = renovationCategory;

      clusters.push(cluster1);
    });
    console.log('clusterCheck', clusters[0].propertyId);
    return clusters;
  }

  async clusterising2(dataObj: DataObject[]): Promise<Cluster1Dto[]> {
    const clusters: Cluster1Dto[] = [];
    console.log('clusterCheck2', dataObj[0].propid);
    dataObj.forEach((obj) => {
      let metroCategory: number,
        yearCategory: number,
        roomsCategory: number,
        floorCategory: number,
        renovationCategory: number,
        propid: number;

      propid = obj.propid;
      console.log('footMetro', obj.footMetro);
      if (obj.footMetro <= 15) metroCategory = 1;
      else if (obj.footMetro > 15 && obj.footMetro <= 25) metroCategory = 2;
      else if (obj.footMetro > 25 && obj.footMetro <= 35) metroCategory = 3;
      else if (obj.footMetro > 35 && obj.footMetro <= 45) metroCategory = 4;
      else if (obj.footMetro > 45 && obj.footMetro <= 55) metroCategory = 5;
      else if (obj.footMetro > 55 && obj.footMetro <= 65) metroCategory = 6;
      else if (obj.footMetro > 65 && obj.footMetro <= 75) metroCategory = 7;
      else if (obj.footMetro > 75 && obj.footMetro <= 85) metroCategory = 8;
      else if (obj.footMetro > 85 && obj.footMetro <= 95) metroCategory = 9;
      else metroCategory = 10;

      if (obj.year <= 1917) yearCategory = 1;
      else if (obj.year > 1917 && obj.year <= 1970) yearCategory = 2;
      else if (obj.year > 1970 && obj.year <= 1987) yearCategory = 3;
      else if (obj.year > 1987 && obj.year <= 2000) yearCategory = 4;
      else if (obj.year > 2000 && obj.year <= 2014) yearCategory = 5;
      else if (obj.year > 2014 && obj.year <= 2024) yearCategory = 6;
      else yearCategory = 7;

      roomsCategory = obj.rooms;

      if (obj.floor <= 6) floorCategory = 1;
      else floorCategory = 2;

      if (obj.renovation == 'Без ремонта') renovationCategory = 1;
      else if (obj.renovation == 'Косметический ремонт') renovationCategory = 2;
      else if (obj.renovation == 'Евроремонт') renovationCategory = 3;
      else if (obj.renovation == 'Дизайнерский ремонт') renovationCategory = 4;
      else renovationCategory = 5;

      const cluster1 = new Cluster1Dto();

      cluster1.propertyId = propid;
      cluster1.metroCategory = metroCategory;
      cluster1.yearCategory = yearCategory;
      cluster1.roomsCategory = roomsCategory;
      cluster1.floorCategory = floorCategory;
      cluster1.renovationCategory = renovationCategory;

      clusters.push(cluster1);
    });
    console.log('clusterCheck', clusters[0].propertyId);
    return clusters;
  }

  async clusterising3(dataObj: DataObject[]): Promise<Cluster1Dto[]> {
    const clusters: Cluster1Dto[] = [];
    console.log('clusterCheck2', dataObj[0].propid);
    dataObj.forEach((obj) => {
      let metroCategory: number,
        yearCategory: number,
        roomsCategory: number,
        floorCategory: number,
        renovationCategory: number,
        propid: number;

      propid = obj.propid;
      console.log('footMetro', obj.footMetro);
      if (obj.footMetro <= 10) metroCategory = 1;
      else if (obj.footMetro > 10 && obj.footMetro <= 20) metroCategory = 2;
      else if (obj.footMetro > 20 && obj.footMetro <= 30) metroCategory = 3;
      else return;

      if (obj.year <= 1917) yearCategory = 1;
      else if (obj.year > 1917 && obj.year <= 1970) yearCategory = 2;
      else if (obj.year > 1970 && obj.year <= 1987) yearCategory = 3;
      else if (obj.year > 1987 && obj.year <= 2000) yearCategory = 4;
      else if (obj.year > 2000 && obj.year <= 2014) yearCategory = 5;
      else if (obj.year > 2014 && obj.year <= 2024) yearCategory = 6;
      else return;

      if (obj.rooms <= 4) roomsCategory = obj.rooms;
      else return;

      floorCategory = obj.floor == 1 ? 1 : 2;

      renovationCategory = obj.renovation == 'Без ремонта' ? 1 : 2;

      const cluster1 = new Cluster1Dto();

      cluster1.propertyId = propid;
      cluster1.metroCategory = metroCategory;
      cluster1.yearCategory = yearCategory;
      cluster1.roomsCategory = roomsCategory;
      cluster1.floorCategory = floorCategory;
      cluster1.renovationCategory = renovationCategory;

      clusters.push(cluster1);
    });
    console.log('clusterCheck', clusters[0].propertyId);
    return clusters;
  }
}
