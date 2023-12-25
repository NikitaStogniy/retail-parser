import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer';
import { DataObject } from './types';
import { setupPage } from 'src/setupPage';
import { initializeDataObject } from 'src/initializeDataObject';

import { USER_AGENT, MONTHS, DataObject } from './types';
import { ParserService } from '../parser.service';
import { ClusterDto } from 'src/demand/dto/cluster.dto';
import { SequelizeService } from 'src/sequelize/sequelize.service';
import axios from 'axios';


@Injectable()
export class CianParserService {
  constructor(private readonly sequelizeService: SequelizeService) {}
  async scraper(browser: Browser, url: string, limit: number) {
    let page = await browser.newPage();

    await setupPage(page, url);
    let scrapedData = [];


    const scrapeCurrentPage = async () => {
      const data: DataObject[] = [];

      let lastPageReached = false;
      let currentPage = 0;
      while (!lastPageReached) {
        console.log('currentPage', currentPage);
        currentPage++;
        const divs = await page.$$("div[data-testid='offer-card']");
        for (let div of divs) {
          await page.waitForTimeout(1000);
          if (data.length >= limit) {
            break;
          }
          let dataObj: DataObject = this.initializeDataObject();

          dataObj['link'] = await this.safeEvaluate(
            div,
            "div[data-testid='offer-card'] > a",
            (node: Element) => node.getAttribute('href'),
            'Не указано',
          );

          dataObj['city'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(1)',
            (node: Element) => node.textContent,
            'Город',
          );
          dataObj['district'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(2)',
            (node: Element) => node.textContent,
            'Район',
          );
          dataObj['historicalDistrict'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(3)',
            (node: Element) => node.textContent,
            'Исторический район',
          );
          dataObj['metro'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(4)',
            (node: Element) => node.textContent,
            'Метро',
          );
          dataObj['street'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(5)',
            (node: Element) => node.textContent,
            'Улицу',
          );
          dataObj['houseNumber'] = await this.safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(6)',
            (node: Element) => node.textContent,
            'Номер дома',
          );
          dataObj['address'] = (
            dataObj['city'] +
            ', ' +
            dataObj['street'] +
            ', ' +
            dataObj['houseNumber']
          ).toString();
          let latLngData;
          try {
            console.log('address', dataObj['address']);
            const response = await axios.get(
              `http://api.positionstack.com/v1/forward?access_key=76a7021f170b92ea7e0ee8b1f4434b0e&query=${encodeURIComponent(
                dataObj['address'],
              )}`,
            );
            latLngData = response.data;
          } catch (error) {
            console.log('address', dataObj['address']);
            console.log(
              `Ошибка при получении данных о широте и долготе: ${error.message}`,
            );
            latLngData = [{ lat: 'Не указано', lon: 'Не указано' }];
          }
          if (latLngData?.data?.[0]) {
            dataObj['lat'] = latLngData.data[0].latitude | 0;
            dataObj['lng'] = latLngData.data[0].longitude | 0;
          } else {
            dataObj['lat'] = 0;
            dataObj['lng'] = 0;
          }

          dataObj['description'] = await this.safeEvaluate(
            div,
            'div[data-name="Description"] > p',
            (node: Element) => {
              let text = node.textContent || 'Описание';
              return text.length > 250 ? text.substring(0, 250) : text;
            },
            'Описание',
          );
          dataObj['footMetro'] = await this.safeEvaluate(
            div,
            'div[data-name="SpecialGeo"] > div',
            (node: Element) => {
              let text = node.textContent || 'Не указано';
              let match = text.match(/\d+/);
              return match ? parseInt(match[0]) : 60;
            },
            'Время до метро',
          );
          dataObj['price'] = await this.safeEvaluate(
            div,
            "span[data-mark='MainPrice']",
            (node: Element) => node.textContent.replace(/\D/g, ''),
            'Цена',
          );

          dataObj['id'] = await this.safeEvaluate(
            div,
            'a._93444fe79c--media--9P6wN',
            (node: Element) => node.getAttribute('href').match(/\d+/)[0],
            'ID',
          );

          //additionalData
          let formattedDate = '';
          try {
            formattedDate = await this.safeEvaluate(
              div,
              'div[data-name="TimeLabel"] > div:nth-child(2) > span',
              (node: Element) => node.textContent,
              'Дата размещения',
            );
            let datePosted = formattedDate.split(', ');
            let day, month;
            let currentYear = new Date().getFullYear();
            if (datePosted[0] === 'сегодня') {
              let today = new Date();
              day = today.getDate();
              month = today.getMonth() + 1; // Месяцы начинаются с 0 в JS
              formattedDate = `${currentYear}-${month}-${day}`;
            } else if (datePosted[0] === 'вчера') {
              let today = new Date();
              today.setDate(today.getDate() - 1);
              day = today.getDate();
              month = today.getMonth() + 1; // Месяцы начинаются с 0 в JS
              formattedDate = `${currentYear}-${month}-${day}`;
            } else {
              [day, month] = datePosted[0].split(' ');

              formattedDate = `${currentYear}-${MONTHS[month]}-${day}`;
            }
          } catch (error) {
            console.error('Ошибка при обработке даты: ', error);
          }
          dataObj['dateposted'] = new Date(formattedDate || '1997-01-10');
          dataObj['ownerID'] = await this.safeEvaluate(
            div,
            'div[data-name="BrandingLevelWrapper"] > div > div:nth-child(2) > div > div > div > span',
            (node: Element) => node.textContent.replace(/\D/g, ''),
            0,
          );
          if (dataObj['ownerID']) {
            dataObj['isByOwner'] = true;
          }
          let button = await div.$('button[data-mark="PhoneButton"]');
          if (!button) {
            await button.click();
            // Ожидание загрузки изображения после клика
            dataObj['phone'] = await this.safeEvaluate(
              div,
              'span[data-mark="PhoneValue"]',
              (span) => span.textContent.replace(/\D/g, ''),
              'Не удалось получить номер телефона',
            );
          }
          //внутренняя информация
          let newPage = await browser.newPage();
          await newPage.setUserAgent(USER_AGENT);
          await newPage.goto(dataObj['link']);
          const idarr = await dataObj['link'].split('/');
          dataObj['propid'] = parseInt(idarr[idarr.length - 2]);
          console.log('propID', idarr);
          let title = await newPage.$eval(
            'div[data-name="OfferTitleNew"]>h1',
            (node: Element) => node.textContent,
          );
          let roomNumber = title.split('-')[0].trim();
          dataObj['rooms'] = parseInt(roomNumber);

          let flatinfoItems = await newPage.$$(
            'div[data-name="OfferSummaryInfoGroup"]:nth-child(1) > div:nth-child(2) > div[data-name="OfferSummaryInfoItem"]',
          );
          if (!flatinfoItems) {
            console.log('flatinfoItems не вызывается');
          } else {
            for (let item of flatinfoItems) {
              let type = await item.$eval(
                'span:nth-child(1)',
                (node: Element) => node.textContent,
              );
              let value = await item.$eval(
                'span:nth-child(2)',
                (node: Element) => node.textContent,
              );
              switch (type) {
                case 'Тип жилья':
                  dataObj['housingType'] = value;
                  break;
                case 'Общая площадь':
                  dataObj['totalArea'] = value
                    ? parseFloat(value.match(/\d+\.?\d*/)[0])
                    : 0;
                  break;
                case 'Жилая площадь':
                  dataObj['livingArea'] = value
                    ? parseFloat(value.match(/\d+\.?\d*/)[0])
                    : 0;
                  break;
                case 'Площадь кухни':
                  dataObj['kitchenArea'] = value
                    ? parseFloat(value.match(/\d+\.?\d*/)[0])
                    : 0;
                  break;
                case 'Высота потолков':
                  dataObj['ceilingHeight'] = value
                    ? parseFloat(value.match(/\d+\.?\d*/)[0])
                    : 0;
                  break;
                case 'Санузел':
                  dataObj['bathroom'] = value;
                  break;
                case 'Балкон/лоджия':
                  dataObj['balcony'] = Boolean(value);
                  break;
                case 'Вид из окон':
                  dataObj['viewFromWindows'] = value;
                  break;
                case 'Ремонт':
                  dataObj['renovation'] = value;
                  break;
              }
            }
          }

          let infoItems = await newPage.$$(
            'div[data-name="OfferSummaryInfoGroup"]:nth-child(2) > div:nth-child(2) > div[data-name="OfferSummaryInfoItem"]',
          );
          if (!infoItems) {
            console.log('infoItems не вызывается');
          } else {
            for (let item of infoItems) {
              let type = await item.$eval(
                'span:nth-child(1)',
                (node: Element) => node.textContent,
              );
              let value = await item.$eval(
                'span:nth-child(2)',
                (node: Element) => node.textContent,
              );
              switch (type) {
                case 'Год постройки':
                  dataObj['year'] = parseInt(value);
                  break;
                case 'Строительная серия':
                  dataObj['buildingSeries'] = value;
                  break;
                case 'Количество лифтов':
                  let elevatorValues = value
                    .split(',')
                    .map((elevator) => parseInt(elevator.match(/\d+/)[0]));
                  let totalElevators = elevatorValues.reduce(
                    (a, b) => a + b,
                    0,
                  );
                  dataObj['elevatorCount'] = totalElevators;
                  break;
                case 'Тип дома':
                  dataObj['buildingType'] = value;
                  break;
                case 'Тип перекрытий':
                  dataObj['overlapType'] = value;
                  break;
                case 'Парковка':
                  dataObj['parking'] = value;
                  break;
                case 'Подъезды':
                  dataObj['entrances'] = parseInt(value);
                  break;
                case 'Отопление':
                  dataObj['heating'] = value;
                  break;
                case 'Аварийность':
                  dataObj['emergency'] = value == 'Нет' ? false : true;
                  break;
              }
            }
          }

          let factoids = await newPage.$$(
            'div[data-name="ObjectFactoidsItem"]',
          );
          for (let factoid of factoids) {
            let type = await factoid.$eval(
              'div:nth-child(2) > span:nth-child(1)',
              (node: Element) => node.textContent,
            );
            let value = await factoid.$eval(
              'div:nth-child(2) > span:nth-child(2)',
              (node: Element) => node.textContent,
            );
            switch (type) {
              case 'Общая площадь':
                dataObj['totalArea'] = value
                  ? parseFloat(value.match(/\d+\.?\d*/)[0])
                  : 0;
                break;
              case 'Жилая площадь':
                dataObj['livingArea'] = value
                  ? parseFloat(value.match(/\d+\.?\d*/)[0])
                  : 0;
                break;
              case 'Площадь кухни':
                dataObj['kitchenArea'] = value
                  ? parseFloat(value.match(/\d+\.?\d*/)[0])
                  : 0;
                break;
              case 'Этаж':
                let floorValues = value.split(' из ');
                dataObj['floor'] = floorValues[0]
                  ? parseInt(floorValues[0])
                  : 0;
                dataObj['totalFloors'] = floorValues[1]
                  ? parseInt(floorValues[1])
                  : 10;
                break;
            }
          }
          dataObj['pricePerMeter'] = dataObj['price'] / dataObj['totalArea'];

          dataObj['cianPrice'] = await this.safeEvaluate(
            newPage,
            'div[data-name="PriceItem"]:nth-child(1) > div:nth-child(1) > span',
            (span) => {
              let priceText = span.textContent;
              let priceMillions = priceText.split(',')[0];
              let priceThousands = priceText.split(',')[1].split(' ')[0];
              return (
                parseInt(priceMillions) * 1000000 +
                parseInt(priceThousands) * 1000
              ).toString();
            },
            0,
          );
          dataObj['serviceName'] = 'cian';

          await this.saveData(dataObj);
          await newPage.close();
        }
        try {
          const newUrl = url + '&p=' + (currentPage + 1);
          console.log('newUrl', newUrl);
          await page.goto(newUrl);
          await page.setUserAgent(USER_AGENT);
          page.setDefaultNavigationTimeout(0);
          console.log(`Navigate to ${newUrl}...`);
        } catch (error) {
          console.error('Ошибка при переходе на следующую страницу: ', error);
          lastPageReached = true;
        }
        const divsOnNewPage = await page.$$("div[data-testid='offer-card']");
        if (divsOnNewPage.length === 0) {
          lastPageReached = true;
        }
      }
      await page.close();

      return data;
    };
    const data = await scrapeCurrentPage();
    console.log('СКОЛЬКО', data.length);
    return data;
  }
  async safeEvaluate(
    page: any,
    selector: string,
    callback: Function,
    defaultValue: string | number | Date,
  ): Promise<any> {
    try {
      return await page.$eval(selector, callback);
    } catch (error) {
      console.log(`Ошибка при обработке ${selector}: ${error.message}`);
      return defaultValue;
    }
  }

  private initializeDataObject(): DataObject {
    const dataObj = initializeDataObject();
    return dataObj;
  }

  async saveData(scrapedData: any) {
    const cluster: ClusterDto[] = await this.clusterising1(scrapedData);
    const cluster2: ClusterDto[] = await this.clusterising2(scrapedData);
    const cluster3: ClusterDto[] = await this.clusterising3(scrapedData);
    const cluster4: ClusterDto[] = await cluster;
    const flats = [];
    flats.push(scrapedData);
    await this.sequelizeService.addFlats(flats);
    await this.sequelizeService.addClusters(await cluster);
    await this.sequelizeService.addClusters2(await cluster2);
    await this.sequelizeService.addClusters3(await cluster3);
    await this.sequelizeService.addClusters4(await cluster4);
  }

  async clusterising1(dataObj: DataObject): Promise<ClusterDto[]> {
    const clusters: ClusterDto[] = [];
    const obj = dataObj;

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

    const cluster1 = new ClusterDto();

    cluster1.propertyId = propid;
    cluster1.metroCategory = metroCategory;
    cluster1.yearCategory = yearCategory;
    cluster1.roomsCategory = roomsCategory;
    cluster1.floorCategory = floorCategory;
    cluster1.renovationCategory = renovationCategory;
    cluster1.lat = obj.lat;
    cluster1.lng = obj.lng;
    cluster1.pricePerMeter = obj.pricePerMeter;
    clusters.push(cluster1);
    return clusters;
  }

  async clusterising2(dataObj: DataObject): Promise<ClusterDto[]> {
    const clusters: ClusterDto[] = [];
    const obj = dataObj;
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

    const cluster1 = new ClusterDto();

    cluster1.propertyId = propid;
    cluster1.metroCategory = metroCategory;
    cluster1.yearCategory = yearCategory;
    cluster1.roomsCategory = roomsCategory;
    cluster1.floorCategory = floorCategory;
    cluster1.renovationCategory = renovationCategory;
    cluster1.lat = obj.lat;
    cluster1.lng = obj.lng;
    cluster1.pricePerMeter = obj.pricePerMeter;
    clusters.push(cluster1);
    console.log('clusterCheck', clusters[0].propertyId);
    return clusters;
  }

  async clusterising3(dataObj: DataObject): Promise<ClusterDto[]> {
    const clusters: ClusterDto[] = [];
    const obj = dataObj;

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

    const cluster1 = new ClusterDto();

    cluster1.propertyId = propid;
    cluster1.metroCategory = metroCategory;
    cluster1.yearCategory = yearCategory;
    cluster1.roomsCategory = roomsCategory;
    cluster1.floorCategory = floorCategory;
    cluster1.renovationCategory = renovationCategory;
    cluster1.lat = obj.lat;
    cluster1.lng = obj.lng;
    cluster1.pricePerMeter = obj.pricePerMeter;
    clusters.push(cluster1);
    return clusters;
  }
}
