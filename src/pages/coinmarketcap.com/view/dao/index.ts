import puppeteer from "puppeteer";
import ScrapedProject from "../../../../@types/scraped-project";
import Proxies from "../../../../proxies";
import { getCurrenciesPageURLs } from "./get-currencies-page-urls";
import { makeJobPerURL } from "./make-job-per-url";
import { setupPage } from "./setup-page";
const proxyHandler = Proxies();

export type Job = () => Promise<ScrapedProject | void>;

/**
 * The optimal proxy strategy is to begin by not using a proxy, and then if we receive a rate limit error,
 * we can switch to using a proxy. At this stage, we should do a race to select the highest performing proxy,
 * and then continue on with the scraping
 */

export default async function coinmarketcapViewDao(browser: puppeteer.Browser) {
  const proxies = await proxyHandler;
  const proxyList = proxies.storage.flattened;

  const page = await setupPage(browser);
  const jobs = [] as Job[];

  const urls = await getCurrenciesPageURLs(page);

  for (const url of urls) {
    makeJobPerURL(url, browser, proxyList, jobs); // TODO create batch all with same URL for Promise.race
  }

  const concurrency = 2;
  const batchResults = [] as (ScrapedProject | void)[][];
  while (jobs.length) {
    const batch = jobs.splice(0, concurrency).map((f) => f());
    batchResults.push(await Promise.all(batch)); // TODO Promise.race between same URL ?
  }

  return [...batchResults.filter((s) => Boolean(s))].flat() as ScrapedProject[];
}
