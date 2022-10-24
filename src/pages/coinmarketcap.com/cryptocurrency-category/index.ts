import puppeteer from "puppeteer";
export default async (browser: puppeteer.Browser, page: puppeteer.Page) => {
  // console.trace("category");
  throw new Error("Not implemented");
  // const currencies = await page.$$(`td:nth-child(3) a[href^="/currencies/"]`);
  // if (!currencies) {
  //   throw new Error(`No list found`);
  // } else {
  //   const urls = extractURLs(currencies);
  //   console.log({ urls });
  // }
};
