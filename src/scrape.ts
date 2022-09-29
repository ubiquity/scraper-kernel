import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

import pMap from "p-map";

export default async function scrape(urls: string[] | string, browser?: Browser, concurrency?: number) {
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

export async function _scrapeSeries(urls: string[], browser: Browser) {
  const completedScrapes = [] as unknown[];
  for (const url of urls) {
    completedScrapes.push(await _scrapeSingle(url, browser));
  }
  return completedScrapes;
}

export async function _scrapeConcurrently(urls: string[], browser: Browser, concurrency: number) {
  const input: AsyncIterable<unknown> | Iterable<unknown> = urls;
  const mapper = async (site) => await _scrapeSingle(site, browser);
  const options = { concurrency };
  return await pMap(input, mapper, options);
}

export async function _scrapeSingle(url: string, browser: Browser) {
  const scrapeCompleted = new Promise(addCallbackEvent);
  console.log(`>>`, url); // useful to follow headless page navigation
  const tab = await newTabToURL(browser, url);
  const result = await scrapeCompleted;
  await tab.close(); // save memory
  return result;
}

async function attachEventsOnFirstRun(browser: Browser | undefined) {
  if (!browser) {
    browser = await browserSetup(config);
    attachEvents(browser);
  }
  return browser;
}

export const eventEmitter = new EventEmitter();
type ResolveFunction = (results: string) => void;
function addCallbackEvent(resolve: ResolveFunction): void {
  eventEmitter.once("scrapecomplete", eventHandlers.scrapeComplete(resolve));
}
