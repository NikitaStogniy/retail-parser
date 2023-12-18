import puppeteer, { Browser } from 'puppeteer';

export async function startBrowser() {
  let browser: Browser;
  try {
    console.log('Opening the browser......');
    browser = await puppeteer.launch({
      // executablePath:
      //   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      executablePath: '/usr/bin/google-chrome-stable',
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
      //ignoreHTTPSErrors: true,
    });
  } catch (err) {
    console.log('Could not create a browser instance => : ', err);
  }
  return browser;
}
