import puppeteer, { ElementHandle } from "puppeteer";
import PageProps from "../../../../@types/page-props";
import { extractURLs, getMarketCap, getProperty, scrollToBottom } from "../../../../common";

export default async (page: puppeteer.Page, pageLoad: Promise<puppeteer.HTTPResponse | null>) => {
  await scrollToBottom(page);
  const urls = await getCmcPageURLs(page);
  // console.log({ urls });

  await page.goto(urls[0]);
  await pageLoad;
  const propsHandler = (await page.$(`script#__NEXT_DATA__[type="application/json"]`)) as ElementHandle<Element>;
  const propsRawString = await getProperty(propsHandler, "textContent");
  const { props } = JSON.parse(propsRawString) as PageProps;
  // console.log(props);
  // console.log(props.initialProps);
  const data = props.initialProps.pageProps.info;
  delete data.platforms;
  delete data.relatedCoins;
  delete data.relatedExchanges;
  delete data.wallets;
  delete data.holders;
  console.log(JSON.stringify(data));
  // const marketCaps = await getMarketCaps(page);
  // console.log({ marketCaps });
};

async function getCmcPageURLs(page: puppeteer.Page) {
  const currencies = await page.$$(`td:nth-child(3) a[href^="/currencies/"]`);
  if (!currencies) {
    throw new Error(`No currencies found`);
  } else {
    const urls = await extractURLs(currencies);
    return urls;
  }
}

async function getMarketCaps(page: puppeteer.Page) {
  const marketCaps = await page.$$(`td:nth-child(7) span:last-child`);
  if (!marketCaps) {
    throw new Error(`No market caps found`);
  } else {
    const mcaps = await getMarketCap(marketCaps);
    return mcaps;
  }
}
