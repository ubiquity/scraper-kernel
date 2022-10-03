import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

import pMap from "p-map";
export const eventEmitter = new EventEmitter();

export type JobResult = string | null; // definitely string, but not sure if `void` or `null` is correct to signal no results found

export default async function scrape(urls: string[] | string, browser?: Browser, concurrency?: number): Promise<JobResult | JobResult[]> {
  browser = await attachEventsOnFirstRun(browser);

  if (typeof urls === "string") {
    return await _scrapeSingle(urls, browser);
  } else if (Array.isArray(urls)) {
    if (concurrency) {
      return await _scrapeConcurrently(urls, browser, concurrency);
    } else {
      return await _scrapeSeries(urls, browser);
    }
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

export async function _scrapeConcurrently(urls: string[], browser: Browser, concurrency: number): Promise<JobResult[]> {
  const input: AsyncIterable<unknown> | Iterable<unknown> = urls;
  const mapper = async (site) => await _scrapeSingle(site, browser);
  const options = { concurrency };
  const pmap = await pMap(input, mapper, options).catch((error) => error && console.trace(error));
  debugger;
  return pmap;
}

export async function _scrapeSingle(url: string, browser: Browser): Promise<JobResult> {
  type ResolveFunction = (results: string) => void;
  const scrapeJob = new Promise(function addCallbackEvent(resolve: ResolveFunction, reject): void {
    eventEmitter.once("scrapecomplete", eventHandlers.scrapeComplete(resolve, reject));
  });
  console.log(`>>`, url); // useful to follow headless page navigation
  const tab = await newTabToURL(browser, url);
  // console.trace("closing tab");
  try {
    const results = await scrapeJob;
    await tab.close(); // save memory
    return results;
  } catch (error) {
    console.error(error);
  }
  return null;
}

async function attachEventsOnFirstRun(browser?: Browser) {
  if (!browser) {
    browser = await browserSetup(config);
    attachEvents(browser);
  }
  return browser;
}
