import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer';
import { MONTHS, USER_AGENT, DataObject } from './types';

@Injectable()
export class CianParserService {
  async scraper(browser: Browser, url: string, limit: number) {
    let page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    page.setDefaultNavigationTimeout(0);
    console.log(`Navigate to ${url}...`);
    await page.goto(url);
    let scrapedData = [];
    const scrapeCurrentPage = async () => {
      const data: DataObject[] = [];
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
        await page.waitForSelector('div[data-testid="offer-card"');
        if (data.length >= limit) {
          break;
        }
        const divs = await page.$$("div[data-testid='offer-card']");
        for (let div of divs) {
          if (data.length >= limit) {
            break;
          }
          let dataObj: DataObject = this.initializeDataObject();

          dataObj['link'] = await safeEvaluate(
            div,
            "div[data-testid='offer-card'] > a",
            (node: Element) => node.getAttribute('href'),
            'Не указано',
          );
          dataObj['propid'] = await safeEvaluate(
            div,
            'a._93444fe79c--media--9P6wN',
            (node: Element) => node.getAttribute('href').match(/\d+/)[0],
            'ID',
          );

          let button = await div.$('button[data-mark="PhoneButton"]');
          if (button) {
            await button.click();
            await new Promise((resolve) => setTimeout(resolve, 3000));
            dataObj['phone'] = await safeEvaluate(
              div,
              'span[data-mark="PhoneValue"]',
              (span) => span.textContent.replace(/\D/g, ''),
              'Не удалось получить номер телефона',
            );
          }
          let dialog = await page.$('div[role="dialog"]');
          if (dialog) {
            let closeButton = await dialog.$('div[aria-label="Закрыть"]');
            if (closeButton) {
              await closeButton.click();
            }
          }
          dataObj['serviceName'] = 'cian';
          data.push(dataObj);
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
      propid: 0,
      phone: '',
    };
    return dataObj;
  }
}
