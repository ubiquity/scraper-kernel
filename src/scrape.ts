import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

export const eventEmitter = new EventEmitter();
export type JobResult = Error | string | null;

export default async function scrape(
  urls: string[] | string,
  pagesDirectory: string, // page logic directory path
  browser?: Browser
): Promise<JobResult | JobResult[]> {
  if (!pagesDirectory) {
    throw new Error("Need page logic path");
  }

  browser = await attachEventsOnFirstRun(pagesDirectory, browser);

  if (typeof urls === "string") {
    const singleResult = await _scrapeSingle(urls, browser);
    return singleResult;
  } else if (Array.isArray(urls)) {
    const seriesResults = await _scrapeSeries(urls, browser);
    return seriesResults;
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

type ResolveFunction = (results: string) => void;
export async function _scrapeSingle(url: string, browser: Browser): Promise<JobResult | Error> {
  const scrapeJob = new Promise(function addCallbackEvent(resolve: ResolveFunction, reject): void {
    eventEmitter.once("scrapecomplete", eventHandlers.scrapeComplete(resolve, reject));
  });
  console.log(`>>`, url); // useful to follow headless page navigation
  const { page, response } = await newTabToURL(browser, url);
  if (response.status() >= 300) {
    return new Error(`<< [ ${url} ] HTTP status code ${response.status()}`);
  }
  const results = await scrapeJob;
  if (results == void 0) {
    return new Error("Scrape Job returned `undefined`. Set return type on page controller to `null` to fix this error");
  }
  await page.close(); // save memory
  return results;
}

async function attachEventsOnFirstRun(pagesDirectory: string, browser?: Browser) {
  if (!browser) {
    browser = await browserSetup(config);
    attachEvents(browser, pagesDirectory);
  }
  return browser;
}
