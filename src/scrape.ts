import { EventEmitter } from "events";
import pMap from "p-map";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";
import { log } from "./utils";

export const eventEmitter = new EventEmitter();
export type JobResult = Error | string | null; // definitely string, but not sure if `void` or `null` is correct to signal no results found

export default async function scrape(
  urls: string[] | string,
  browser?: Browser
  // , concurrency?: number
): Promise<JobResult | JobResult[]> {
  browser = await attachEventsOnFirstRun(browser);

  if (typeof urls === "string") {
    const singleResult = await _scrapeSingle(urls, browser);
    // console.trace({ urls, singleResult });
    return singleResult;
  } else if (Array.isArray(urls)) {
    // if (concurrency) {
    //   const concurrentResults = await _scrapeConcurrently(urls, browser, concurrency);
    //   // console.trace({ urls, concurrentResults });
    //   throw concurrentResults; // @FIXME: should return when this doesn't throw an error
    // } else {
    const seriesResults = await _scrapeSeries(urls, browser);
    // console.trace({ urls, seriesResults });
    return seriesResults;
    // }
  } else {
    throw new Error("`urls` must be of types `string[] | string` ");
  }
}

export async function _scrapeSeries(urls: string[], browser: Browser): Promise<JobResult[]> {
  const completedScrapes = [] as JobResult[];
  for (const url of urls) {
    completedScrapes.push(await _scrapeSingle(url, browser));
  }
  return completedScrapes;
}

export async function _scrapeConcurrently(urls: string[], browser: Browser, concurrency: number) {
  // : Promise<JobResult[]>
  return new Error("function _scrapeConcurrently isn't implemented correctly");
  // const input: AsyncIterable<unknown> | Iterable<unknown> = urls;
  // const mapper = async (site) => await _scrapeSingle(site, browser);
  // const options = { concurrency };
  // const map = await pMap(input, mapper, options).catch((error) => error && console.trace(error));
  // // debugger;
  // return map;
}

export async function _scrapeSingle(url: string, browser: Browser): Promise<JobResult | Error> {
  type ResolveFunction = (results: string) => void;
  const scrapeJob = new Promise(function addCallbackEvent(resolve: ResolveFunction, reject): void {
    eventEmitter.once("scrapecomplete", eventHandlers.scrapeComplete(resolve, reject));
  });
  console.log(`>>`, url); // useful to follow headless page navigation
  const { page, response } = await newTabToURL(browser, url);
  if (response.status() >= 300) {
    return new Error(`<< [ ${url} ] HTTP status code ${response.status()}`);
  }
  const results = await scrapeJob.catch((error) => error && log.error(error.message));
  console.trace(results);
  if (results == void 0) {
    return new Error("Scrape Job returned `undefined`. Set return type on page controller to `null` to fix this error");
  }
  await page.close(); // save memory
  return results;
}

async function attachEventsOnFirstRun(browser?: Browser) {
  if (!browser) {
    browser = await browserSetup(config);
    return attachEvents(browser);
  }
  return browser;
}
