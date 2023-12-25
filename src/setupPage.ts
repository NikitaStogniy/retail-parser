import { USER_AGENT } from './parser/parsers/types';

export async function setupPage(page, url) {
  await page.setUserAgent(USER_AGENT);
  page.setDefaultNavigationTimeout(0);
  await page.goto(url);
}
