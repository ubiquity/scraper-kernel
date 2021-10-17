import puppeteer, { ElementHandle } from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import PageProps from "../../../../@types/page-props";
import ScrapedProject from "../../../../@types/scraped-project";
import { extractURLs, getAttributeValueFromElements, getProperty, scrollToBottom } from "../../../../common";
import Proxies from "../../../../proxies";

const proxyHandler = Proxies();

export default async function cmcDao(browser: puppeteer.Browser) {
  // const activeTarget = browser.targets()[browser.targets().length - 1];
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }
  await page.bringToFront();
  await scrollToBottom(page);

  const urls = await getCmcPageURLs(page);
  const tokens = [] as ScrapedProject[];

  const proxies = await proxyHandler;
  const proxyList = proxies.storage.flattened;

  for (const url of urls) {
    try {
      const proxy = proxyList.shift();

      if (proxy) {
        const timeout = 5000;
        console.log(`Connecting to "${url}" via "${proxy}"... timeout in ${timeout / 1000} seconds`);

        // test if the proxy is any good by allowing a 5 second timeout.
        // if it times out, it's probably not a good proxy.

        const timer = setTimeout(async () => {
          await page.close();
        }, timeout);

        scrapeProject(browser, proxy, url, tokens);

        clearTimeout(timer);
      } else {
        throw new Error("No proxy available");
      }
    } catch (e) {
      console.error(e);
      console.warn(`Caught error scraping "${url}"`);
    }
  }
  return tokens;
}

async function scrapeProject(browser: puppeteer.Browser, proxy: string, url: string, tokens: ScrapedProject[]) {
  const page = await browser.newPage();

  useProxy(page as object, `http://${proxy}`);

  await page.goto(url);
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const propsHandler = (await page.$(`script#__NEXT_DATA__[type="application/json"]`)) as ElementHandle<Element>;
  const propsRawString = await getProperty(propsHandler, "textContent");
  const { props } = JSON.parse(propsRawString) as PageProps;
  const token = props.initialProps.pageProps.info;
  delete token.platforms;
  delete token.relatedCoins;
  delete token.relatedExchanges;
  delete token.wallets;
  delete token.holders;
  tokens.push(token); //  as ScrapedProject
  console.log(`got ${token.name}`);
  return tokens;
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
