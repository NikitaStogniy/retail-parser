import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer';
import { MONTHS, USER_AGENT, DataObject } from './types';
import { Tesseract } from 'tesseract.ts';

@Injectable()
export class AvitoParserService {
  async scraper(browser: Browser, url: string, limit: number) {
    let page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    page.setDefaultNavigationTimeout(0);
    console.log(`Navigate to ${url}...`);
    await page.goto(url);
    let scrapedData = [];
    const scrapeCurrentPage = async () => {
      const divCount = await page.$$eval(
        "div[data-marker='catalog-serp'] div[class^='iva-item-root-']",
        (divs) => divs.length,
      );

      let rate = await page.$$(
        'form[class="uxs-2w2XclsRLI uxs-scx40f uxs-2Ql_Y1udt8"] > div > div.uxs-QFD9X9QAio.uxs-8a4j0g > button',
      );
      for (let button of rate) {
        await button.click();
      }

      let data: DataObject[] = [];
      const divs = await page.$$(
        "div[data-marker='catalog-serp'] div[class^='iva-item-root-']",
      );

      for (let div of divs) {
        let dataObj: DataObject = this.initializeDataObject();
        dataObj['propid'] = await this.safeEvaluate(
          div,
          '[data-item-id]',
          (node) => node.textContent,
          'ID',
        );
        await page.hover(`div[data-item-id='${dataObj['id']}']`);
        let button = await div.$('button[type="button"]');
        if (button) {
          await button.click();
          try {
            await div.waitForSelector('img[data-marker="phone-image"]', {
              timeout: 30000,
            });
            dataObj['phoneImage'] = await this.safeEvaluate(
              div,
              'img[data-marker="phone-image"]',
              (img) => img.src,
              'Не удалось загрузить изображение',
            );
            let phoneImage = await this.parseImg(dataObj['phoneImage']);
            dataObj['phone'] = phoneImage.toString();
          } catch (error) {
            console.log('Не удалось загрузить изображение: ', error);
            dataObj['phoneImage'] = 'Not found';
          }
        } else {
          dataObj['phoneImage'] = 'Not found';
        }
        data.push(dataObj);
        if (data.length >= limit) {
          break;
        }
      }
      // await page.close();
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

  async parseImg(data) {
    return Tesseract.recognize(data, {
      lang: 'eng',
      logger: (m) => console.log(m),
    }).then(({ text }) => {
      console.log('phone', text);
      return text;
    });
  }

  private initializeDataObject(): DataObject {
    const dataObj: DataObject = {
      link: '',
      propid: 0,
      phone: '',
    };
    return dataObj;
  }
}
