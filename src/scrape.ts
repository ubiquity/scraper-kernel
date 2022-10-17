import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

export const eventEmitter = new EventEmitter();
export type JobResult = Error | string | null | undefined;

export default async function scrape(urls: string[] | string, browser?: Browser): Promise<JobResult | JobResult[]> {
  browser = await attachEventsOnFirstRun(browser);

  if (typeof urls === "string") {
    return await _scrapeSingle(urls, browser);
  } else if (Array.isArray(urls)) {
    return await _scrapeSeries(urls, browser);
  } else {
    throw new Error("`urls` must be of types `string[] | string` ");
  }
}

export async function _scrapeSeries(urls: string[], browser: Browser): Promise<JobResult[]> {
  const completedScrapes = [] as JobResult[];
  for (const url of urls) {
    try {
      const completed = await _scrapeSingle(url, browser);
      completedScrapes.push(completed);
    } catch (error) {
      eventEmitter.emit("logicfailed", error);
    }
  }
  return completedScrapes;
}

type ResolveFunction = (results: string) => void;
export async function _scrapeSingle(url: string, browser: Browser): Promise<JobResult | Error> {
  const job = new Promise(function addCallbackEvent(resolve: ResolveFunction, reject): void {
    try {
      eventEmitter.once("scrapecomplete", eventHandlers.scrapeComplete(resolve, reject));
    } catch (error) {
      eventEmitter.emit("logicfailed", error);
      eventEmitter.emit("breakdown", page);
    }
  });

  console.log(`>>`, url); // useful to follow headless page navigation
  const { page, response, navigation } = await newTabToURL(browser, url);
  if (response.status() >= 300) {
    return new Error(`<< [ ${url} ] HTTP status code ${response.status()}`);
  }
  await navigation;
  const results = await job;

  if (results == void 0) {
    return new Error("Scrape Job returned `undefined`. Set return type on page controller to `null` to fix this error");
  }
  eventEmitter.emit("breakdown", page);
  return results;
}

async function attachEventsOnFirstRun(browser?: Browser) {
  if (!browser) {
    const { blocker, browser } = await browserSetup(config);
    return attachEvents(blocker, browser);
  }
  return browser;
}
