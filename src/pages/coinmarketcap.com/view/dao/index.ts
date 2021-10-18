import puppeteer from "puppeteer";
import ScrapedProject from "../../../../@types/scraped-project";
import Proxies from "../../../../proxies";
import { getCurrenciesPageURLs } from "./get-currencies-page-urls";
import { makeJobPerURL } from "./make-job-per-url";
import { setupPage } from "./setup-page";
const proxyHandler = Proxies();

export default async function coinmarketcapViewDao(browser: puppeteer.Browser) {
  const proxies = await proxyHandler;
  const proxyList = proxies.storage.flattened;

  const page = await setupPage(browser);
  const jobs = [] as (() => Promise<ScrapedProject>)[];

  const urls = await getCurrenciesPageURLs(page);

  for (const url of urls) {
    makeJobPerURL(url, browser, proxyList, jobs);
  }

  console.log({ jobs });

  const concurrency = 1;
  const batchResults = [] as ScrapedProject[][];
  while (jobs.length) {
    const batch = jobs.splice(0, concurrency).map((f) => f());
    batchResults.push(await Promise.all(batch));
  }

  return [...batchResults].flat();
}
