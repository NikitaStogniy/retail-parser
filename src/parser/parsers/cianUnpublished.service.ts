import { Injectable } from '@nestjs/common';
import { Browser } from 'puppeteer';
import { USER_AGENT } from './types';

@Injectable()
export class CianUnpublishedParserService {
  async scraper(browser: Browser, url: string) {
    let page = await browser.newPage();
    await page.setUserAgent(USER_AGENT);
    page.setDefaultNavigationTimeout(0);
    console.log(`Navigate to ${url}...`);
    await page.goto(url);
    const scrapeCurrentPage = async () => {
      const isOfferUnpublishedExists =
        (await page.$('div[data-name="OfferUnpublished"]')) !== null;
      console.log(isOfferUnpublishedExists);
      await page.close();
      return isOfferUnpublishedExists;
    };
    const data = await scrapeCurrentPage();
    return data;
  }
}
