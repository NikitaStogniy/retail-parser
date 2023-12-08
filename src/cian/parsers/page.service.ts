import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer';
import { DataObject } from './types';
const MONTHS = {
  янв: '01',
  фев: '02',
  мар: '03',
  апр: '04',
  май: '05',
  июн: '06',
  июл: '07',
  авг: '08',
  сен: '09',
  окт: '10',
  ноя: '11',
  дек: '12',
};

const USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/66.0.3359.181 Safari/537.36';

@Injectable()
export class ScraperPageObject {
  async scraper(browser: Browser, url: string, limit: number) {
    let page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    page.setDefaultNavigationTimeout(0);
    console.log(`Navigate to ${url}...`);
    await page.goto(url);
    let scrapedData = [];
    let dataObj: DataObject = this.initializeDataObject(url);

    let title = await this.safeEvaluate(
      page,
      'div[data-name="OfferTitleNew"]>h1',
      (node: Element) => node.textContent,
      '',
    );

    let roomNumber = title.split('-')[0].trim();
    dataObj['rooms'] = parseInt(roomNumber);

    dataObj['description'] = await this.safeEvaluate(
      page,
      'div[data-name="Description"] > div > div > div > span',
      (node: Element) => node.textContent,
      '',
    );

    let flatinfoItems = await page.$$(
      'div[data-name="OfferSummaryInfoGroup"]:nth-child(1) > div:nth-child(2) > div[data-name="OfferSummaryInfoItem"]',
    );
    if (!flatinfoItems) {
      console.log('flatinfoItems не вызывается');
    } else {
      for (let item of flatinfoItems) {
        let type = await this.safeEvaluate(
          item,
          'span:nth-child(1)',
          (node: Element) => node.textContent,
          '',
        );
        let value = await this.safeEvaluate(
          item,
          'span:nth-child(2)',
          (node: Element) => node.textContent,
          '',
        );
        switch (type) {
          case 'Тип жилья':
            dataObj['housingType'] = value;
            break;
          case 'Общая площадь':
            dataObj['totalArea'] =
              value && value.match(/\d+\.?\d*/)
                ? parseFloat(value.match(/\d+\.?\d*/)[0])
                : 0;
            break;
          case 'Жилая площадь':
            dataObj['livingArea'] =
              value && value.match(/\d+\.?\d*/)
                ? parseFloat(value.match(/\d+\.?\d*/)[0])
                : 0;
            break;
          case 'Площадь кухни':
            dataObj['kitchenArea'] =
              value && value.match(/\d+\.?\d*/)
                ? parseFloat(value.match(/\d+\.?\d*/)[0])
                : 0;
            break;
          case 'Высота потолков':
            dataObj['ceilingHeight'] =
              value && value.match(/\d+\.?\d*/)
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

    dataObj['ownerID'] = await this.safeEvaluate(
      page,
      'div[data-name="HomeownerLayout"] > div > span:nth-child(2)',
      (node: Element) => node.textContent.replace(/\D/g, ''),
      0,
    );

    let infoItems = await page.$$(
      'div[data-name="OfferSummaryInfoGroup"]:nth-child(2) > div:nth-child(2) > div[data-name="OfferSummaryInfoItem"]',
    );
    if (!infoItems) {
      console.log('infoItems не вызывается');
    } else {
      console.log(infoItems.length);
      for (let item of infoItems) {
        let type = await this.safeEvaluate(
          item,
          'span:nth-child(1)',
          (node: Element) => node.textContent,
          0,
        );
        let value = await this.safeEvaluate(
          item,
          'span:nth-child(2)',
          (node: Element) => node.textContent,
          0,
        );
        switch (type) {
          case 'Год постройки':
            dataObj['year'] = value;
            break;
          case 'Строительная серия':
            dataObj['buildingSeries'] = value;
            break;
          case 'Количество лифтов':
            let elevatorValues = value
              .split(',')
              .map((elevator) => parseInt(elevator.match(/\d+/)[0]));
            let totalElevators = elevatorValues.reduce((a, b) => a + b, 0);
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
            dataObj['entrances'] = value;
            break;
          case 'Отопление':
            dataObj['heating'] = value;
            break;
          case 'Аварийность':
            dataObj['emergency'] = value;
            break;
        }
      }
    }

    let formattedDate;
    try {
      const posted = await this.safeEvaluate(
        page,
        'div[data-testid="metadata-added-date"] > span',
        (node: Element) => node.textContent,
        'Дата размещения',
      );
      let datePosted = posted.replace('Обновлено:', '').split(', ');
      let day, month;
      let currentYear = new Date().getFullYear();
      if (datePosted[0] === 'сегодня') {
        let today = new Date();
        day = today.getDate();
        month = today.getMonth() + 1;
        formattedDate = `${currentYear}-${month}-${day}`;
      } else if (datePosted[0] === 'вчера') {
        let today = new Date();
        today.setDate(today.getDate() - 1);
        day = today.getDate();
        month = today.getMonth() + 1;
        formattedDate = `${currentYear}-${month}-${day}`;
      } else {
        [day, month] = datePosted[0].split(' ');

        formattedDate = `${currentYear}-${MONTHS[month]}-${day}`;
      }
    } catch (error) {
      console.error('Ошибка при обработке даты: ', error);
    }
    dataObj['dateposted'] = new Date(formattedDate || '1997-01-10');

    dataObj['city'] = await this.safeEvaluate(
      page,
      'a[data-name="AddressItem"]:nth-child(1)',
      (node: Element) => node.textContent,
      'Город',
    );
    dataObj['district'] = await this.safeEvaluate(
      page,
      'a[data-name="AddressItem"]:nth-child(2)',
      (node: Element) => node.textContent,
      'Район',
    );
    dataObj['historicalDistrict'] = await this.safeEvaluate(
      page,
      'a[data-name="AddressItem"]:nth-child(3)',
      (node: Element) => node.textContent,
      'Исторический район',
    );
    dataObj['street'] = await this.safeEvaluate(
      page,
      'a[data-name="AddressItem"]:nth-child(4)',
      (node: Element) => node.textContent,
      'Улицу',
    );
    dataObj['houseNumber'] = await this.safeEvaluate(
      page,
      'a[data-name="AddressItem"]:nth-child(5)',
      (node: Element) => node.textContent,
      'Номер дома',
    );

    dataObj['metro'] = await this.safeEvaluate(
      page,
      'li[data-name="UndergroundItem"]:nth-child(1) > a',
      (node: Element) => node.textContent,
      'Метро',
    );

    try {
      dataObj['footMetro'] = await this.safeEvaluate(
        page,
        'li[data-name="UndergroundItem"]:nth-child(1) > span',
        (node: Element) => parseInt(node.textContent.match(/\d+/)[0]),
        60,
      );
    } catch (error) {
      console.error('Ошибка при обработке расстояния до метро: ', error);
      dataObj['footMetro'] = 60;
    }

    dataObj['price'] = await this.safeEvaluate(
      page,
      'div[data-testid="price-amount"] > span',
      (node: Element) => parseInt(node.textContent.replace(/\s/g, '')),
      'Цена',
    );

    let factoids = await page.$$('div[data-name="ObjectFactoidsItem"]');
    for (let factoid of factoids) {
      console.log(factoids.length);
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
          console.log(value);
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
          dataObj['floor'] = floorValues[0] ? parseInt(floorValues[0]) : 0;
          dataObj['totalFloors'] = floorValues[1]
            ? parseInt(floorValues[1])
            : 0;
          break;
      }
    }
    dataObj['cianPrice'] = await this.safeEvaluate(
      page,
      'div[data-name="PricesBlock"]>div:nth-child(1)>div>div:nth-child(1)>span',
      (span) => {
        let priceText = span.textContent;
        let priceMillions = priceText.split(',')[0];
        let priceThousands = priceText.split(',')[1].split(' ')[0];
        return (
          parseInt(priceMillions) * 1000000 +
          parseInt(priceThousands) * 1000
        ).toString();
      },
      'Цена от cian',
    );
    dataObj['serviceName'] = 'cian';
    let propid = parseInt(url.split('/')[4]);
    dataObj['propid'] = isNaN(propid) ? 0 : propid;
    await page.close();
    return dataObj;
  }

  async safeEvaluate(
    page: any,
    selector: string,
    callback: Function,
    defaultValue: string | number | Date,
  ): Promise<any> {
    try {
      const result = await page.$eval(selector, callback);
      return isNaN(result) ? defaultValue : result;
    } catch (error) {
      console.log(`Ошибка при обработке ${selector}: ${error.message}`);
      return defaultValue;
    }
  }

  private initializeDataObject(url: string): DataObject {
    const dataObj: DataObject = {
      link: url,
      address: '',
      city: '',
      district: '',
      historicalDistrict: '',
      metro: '',
      street: '',
      houseNumber: '',
      description: '',
      footMetro: 0,
      carMetro: 0,
      price: 0,
      propid: 0,
      dateposted: new Date(),
      ownerID: 0,
      phone: '',
      housingType: '',
      totalArea: 0,
      livingArea: 0,
      kitchenArea: 0,
      ceilingHeight: 0,
      bathroom: '',
      balcony: false,
      viewFromWindows: '',
      renovation: '',
      year: 0,
      buildingSeries: '',
      elevatorCount: 0,
      buildingType: '',
      overlapType: '',
      parking: '',
      entrances: 0,
      heating: '',
      emergency: false,
      floor: 0,
      totalFloors: 0,
      cianPrice: 0,
      serviceName: '',
      rooms: 0,
      pricePerMeter: 0,
      isByOwner: false,
      updated: new Date(),
      scrapedAt: new Date(),
    };
    return dataObj;
  }
}
