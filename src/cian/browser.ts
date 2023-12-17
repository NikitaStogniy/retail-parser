import puppeteer, { Browser } from 'puppeteer';

export async function startBrowser() {
  let browser: Browser;
  try {
    console.log('Opening the browser......');
    browser = await puppeteer.launch({
      headless: false,
      executablePath:
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      args: ['--disable-setuid-sandbox', '--no-sandbox'],
      ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log('Could not create a browser instance => : ', err);
  }
  return browser;
}
