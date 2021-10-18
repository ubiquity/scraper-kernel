import puppeteer, { ElementHandle } from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import PageProps from "../../../../@types/page-props";
import ScrapedProject from "../../../../@types/scraped-project";
import { extractURLs, getAttributeValueFromElements, getProperty, scrollToBottom } from "../../../../common";
import Proxies from "../../../../proxies";
import { events } from "./../../../../boot/browser-setup";
const proxyHandler = Proxies();
export default async function coinmarketcapViewDao(browser: puppeteer.Browser) {
  const page = await setupPage(browser);
  const jobs = [] as (() => Promise<ScrapedProject>)[]; // not sure what type this should be
  const urls = await getCmcPageURLs(page);

  const proxies = await proxyHandler;
  const proxyList = proxies.storage.flattened;

  for (const url of urls) {
    jobs.push(() => delegateRequestsToProxies(browser, url, proxyList));
  }

  const concurrency = 2;
  const batchResults = [] as ScrapedProject[][];
  while (jobs.length) {
    const batch = jobs.splice(0, concurrency).map((f) => f());
    batchResults.push(await Promise.all(batch));
  }

  return [...batchResults].flat();
}

async function setupPage(browser: puppeteer.Browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }
  await scrollToBottom(page);
  return page;
}

async function delegateRequestsToProxies(browser: puppeteer.Browser, url: string, proxyList: string[], _page?: puppeteer.Page) {
  console.log(`setting up proxies for ${url}`);
  const proxy = proxyList.shift();
  if (!proxy) {
    throw new Error("No proxy available");
  }

  const timeout = 5000;
  console.log(`Connecting to "${url}" via "${proxy}"... timeout in ${timeout / 1000} seconds`);

  if (_page) {
    console.log(`stopping page`);
    await _page.evaluate(() => stop()); // dont think that does anything, seems to still load
  }
  const page = _page || (await browser.newPage());

  const timer = setTimeout(() => events.emit("proxytimeout", () => delegateRequestsToProxies(browser, url, proxyList, page)), timeout);

  useProxy(page as object, `http://${proxy}`);
  await page.goto(url);
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  clearTimeout(timer);

  const token = await projectScrape(page);
  return token;
}

async function projectScrape(page: puppeteer.Page) {
  const propsHandler = (await page.$(`script#__NEXT_DATA__[type="application/json"]`)) as ElementHandle<Element>;
  const propsRawString = await getProperty(propsHandler, "textContent");
  const { props } = JSON.parse(propsRawString) as PageProps;
  const token = props.initialProps.pageProps.info;
  delete token.platforms;
  delete token.relatedCoins;
  delete token.relatedExchanges;
  delete token.wallets;
  delete token.holders;
  console.log(`got ${token.name}`);
  return token;
}

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
    const mcaps = await getAttributeValueFromElements(marketCaps, "textContent");
    return mcaps;
  }
}
