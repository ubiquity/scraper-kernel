import Puppeteer from "puppeteer";
export default async (browser: Puppeteer.Browser) => {
  //   const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const navigationPromise = page.waitForNavigation();

  await page.goto("https://coinmarketcap.com/view/olympus-pro-ecosystem/");

  await page.setViewport({ width: 1918, height: 1592 });

  await page.waitForSelector(".h7vnx2-1 > .h7vnx2-2 > tbody > tr:nth-child(1) > td:nth-child(3)");
  await page.click(".h7vnx2-1 > .h7vnx2-2 > tbody > tr:nth-child(1) > td:nth-child(3)");

  await page.waitForSelector(".h7vnx2-2 > tbody > tr:nth-child(1) > td > .escjiH");
  await page.click(".h7vnx2-2 > tbody > tr:nth-child(1) > td > .escjiH");

  await page.waitForSelector("tr:nth-child(1) > td > .sc-16r8icm-0 > .cmc-link > .sc-16r8icm-0 > .coin-logo");
  await page.click("tr:nth-child(1) > td > .sc-16r8icm-0 > .cmc-link > .sc-16r8icm-0 > .coin-logo");

  await navigationPromise;

  await page.waitForSelector(".sc-16r8icm-0 > .sc-16r8icm-0 > .sc-10up5z1-0 > .sc-16r8icm-0:nth-child(1) > .content");
  await page.click(".sc-16r8icm-0 > .sc-16r8icm-0 > .sc-10up5z1-0 > .sc-16r8icm-0:nth-child(1) > .content");

  await page.waitForSelector(".sc-10up5z1-0 > .sc-16r8icm-0 > .content > li:nth-child(1) > .link-button");
  await page.click(".sc-10up5z1-0 > .sc-16r8icm-0 > .content > li:nth-child(1) > .link-button");

  const list = document.querySelector(`ul.content`);
  if (!list) throw new Error(`No list found`);

  const urls = getInterestingURLs(list);
  console.log(urls);

  await browser.close();
};

function getInterestingURLs(element: Element) {
  const urls = [] as string[];
  const anchors = element.getElementsByTagName(`a`);
  anchors?.length &&
    [...anchors].forEach((anchor) => {
      if (anchor.href.length) {
        urls.push(anchor.href);
      }
    });
  return urls;
}
