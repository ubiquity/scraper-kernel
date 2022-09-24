import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

export default async function scrape(urls: string[] | string, browser?: Browser, concurrency?: number) {
  browser = await attachEventsOnFirstRun(browser);

  if (Array.isArray(urls)) {
    if (concurrency) {
      return await scrapeConcurrently(urls, browser, concurrency);
    }
    return await scrapeSeries(urls, browser);
  } else if (typeof urls === "string") {
    return await scrapeSingle(urls, browser);
  } else {
    throw new Error("`urls` must be of types `string[] | string` ");
  }
}

export async function scrapeSeries(urls: string[], browser: Browser) {
  const completedScrapes = [] as unknown[];
  for (const url of urls) {
    completedScrapes.push(await scrapeSingle(url, browser));
  }
  return completedScrapes;
}

export async function scrapeConcurrently(urls: string[], browser: Browser, concurrency?: number) {
  const pendingScrapes = [] as Promise<unknown>[];
  for (const url of urls) {
    pendingScrapes.push(scrapeSingle(url, browser));
  }

  // const actions = [
  // 	() => got('https://sindresorhus.com'),
  // 	() => got('https://avajs.dev'),
  // 	() => checkSomething(),
  // 	() => doSomethingElse()
  // ];

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error

  await (await import("p-all")).default(pendingScrapes, { concurrency: concurrency || 6 }); // http2 simultaneous connection limit?
}

export async function scrapeSingle(url: string, browser: Browser) {
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
function addCallbackEvent(resolve: ResolveFunction): void {
  events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
}
type ResolveFunction = (results: string) => void;
export const events = new EventEmitter();
