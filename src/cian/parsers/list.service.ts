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
export class ScraperListObject {
  async scraper(browser: Browser, url: string, limit: number) {
    let page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    page.setDefaultNavigationTimeout(0);
    console.log(`Navigate to ${url}...`);
    await page.goto(url);
    let scrapedData = [];
    const scrapeCurrentPage = async () => {
      const data: DataObject[] = [];
      const count = await page.$$eval(
        "div[data-name='SummaryHeader'] > h5",
        (h5s) => {
          let text = h5s[0].textContent;
          let numberPattern = /\d+/g;
          let numbers = text.match(numberPattern);
          return numbers ? parseInt(numbers[0]) : 0;
        },
      );
      if (count < limit || limit == 0) {
        limit = count;
      }
      limit = 100;

      async function safeEvaluate(page, selector, callback, defaultValue) {
        try {
          return await page.$eval(selector, callback);
        } catch (error) {
          console.log(`Не удалось найти ${selector}`);
          return defaultValue;
        }
      }
      let currentPage = 1;
      let lastPageReached = false;

      while (!lastPageReached) {
        if (data.length >= limit) {
          break;
        }
        const divs = await page.$$("div[data-testid='offer-card']");
        for (let div of divs) {
          if (data.length >= limit) {
            break;
          }
          let dataObj: DataObject = this.initializeDataObject();

          //maindData
          dataObj['link'] = await safeEvaluate(
            div,
            "div[data-testid='offer-card'] > a",
            (node: Element) => node.getAttribute('href'),
            'Не указано',
          );

          dataObj['city'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(1)',
            (node: Element) => node.textContent,
            'Город',
          );
          dataObj['district'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(2)',
            (node: Element) => node.textContent,
            'Район',
          );
          dataObj['historicalDistrict'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(3)',
            (node: Element) => node.textContent,
            'Исторический район',
          );
          dataObj['metro'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(4)',
            (node: Element) => node.textContent,
            'Метро',
          );
          dataObj['street'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(5)',
            (node: Element) => node.textContent,
            'Улицу',
          );
          dataObj['houseNumber'] = await safeEvaluate(
            div,
            'a[data-name="GeoLabel"]:nth-child(6)',
            (node: Element) => node.textContent,
            'Номер дома',
          );
          dataObj['address'] = (dataObj['city'],
          dataObj['district'],
          dataObj['historicalDistrict'],
          dataObj['metro'],
          dataObj['street'],
          dataObj['houseNumber']).toString();
          dataObj['description'] = await safeEvaluate(
            div,
            'div[data-name="Description"] > p',
            (node: Element) => {
              let text = node.textContent || 'Описание';
              return text.length > 250 ? text.substring(0, 250) : text;
            },
            'Описание',
          );
          dataObj['footMetro'] = await safeEvaluate(
            div,
            'div[data-name="SpecialGeo"] > div',
            (node: Element) => {
              let text = node.textContent || 'Не указано';
              let match = text.match(/\d+/);
              return match ? parseInt(match[0]) : 60;
            },
            'Время до метро',
          );
          dataObj['price'] = await safeEvaluate(
            div,
            "span[data-mark='MainPrice']",
            (node: Element) => node.textContent.replace(/\D/g, ''),
            'Цена',
          );

          dataObj['id'] = await safeEvaluate(
            div,
            'a._93444fe79c--media--9P6wN',
            (node: Element) => node.getAttribute('href').match(/\d+/)[0],
            'ID',
          );

          //additionalData
          let formattedDate = '';
          try {
            formattedDate = await safeEvaluate(
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
              let months = {
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
              [day, month] = datePosted[0].split(' ');

              formattedDate = `${currentYear}-${months[month]}-${day}`;
            }
          } catch (error) {
            console.error('Ошибка при обработке даты: ', error);
          }
          dataObj['dateposted'] = new Date(formattedDate || '1997-01-10');
          dataObj['ownerID'] = await safeEvaluate(
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
            dataObj['phone'] = await safeEvaluate(
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

          dataObj['pricepermeter'] = dataObj['price'] / dataObj['totalArea'];

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
          dataObj['cianPrice'] = await safeEvaluate(
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
          data.push(dataObj);

          newPage.close();
        }
        try {
          await page.evaluate(() => {
            Array.from(document.querySelectorAll('a'))
              .find((el) => el.textContent === 'Дальше')
              .click();
          });
        } catch (error) {
          console.error(
            'Не удалось найти элемент для перехода на следующую страницу: ',
            error,
          );
          lastPageReached = true;
          continue;
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
    const dataObj: DataObject = {
      link: '',
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
