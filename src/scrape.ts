import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import { setupConfig } from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";
import { log } from "./logging";
import puppeteer from "puppeteer";

export const events = new EventEmitter();
export type JobResult = Error | string | null;

interface UserSettings {
  urls: string[] | string;
  pages: string; // page logic directory path
  chromium?: string[];
  headful?: boolean;
}

async function scrape(settings: UserSettings, browser?: Browser): Promise<JobResult | JobResult[]> {
  const { pages, urls } = settings;

  if (!pages) {
    throw new Error("Need page logic path");
  }

  if (!browser) {
    const config = setupConfig(settings);
    browser = (await puppeteer.launch(config)) as Browser;
    browser = attachEvents(browser, settings);
  }

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

async function _scrapeSeries(urls: string[], browser: Browser): Promise<JobResult[]> {
  const completedScrapes = [] as JobResult[];

  if (urls.length < 127) {
    // Normal buffer behavior to log.info all of the results at the end cleanly and in order
    for (const url of urls) {
      const result = await _scrapeSingle(url, browser);
      completedScrapes.push(result);
    }
    return completedScrapes;
  }

  return await memoryOptimization();

  async function memoryOptimization() {
    // This was added because the VPS was running out of memory and crashing the process
    // This is a best guess for what could be contributing to the memory leak.
    log.warn(`You are attempting to scrape ${urls.length} pages. This may cause your browser to crash. Consider using a smaller batch size.`);
    log.warn(`This will not collect the batch results in memory (in order to save memory). Your page logic must handle saving the data elsewhere!`);
    for (const url of urls) {
      await _scrapeSingle(url, browser);
    }
    return completedScrapes;
  }
}

type ResolveFunction = (results: string) => void;
async function _scrapeSingle(url: string, browser: Browser): Promise<JobResult | Error> {
  const scrapeJob = new Promise(function addCallbackEvent(resolve: ResolveFunction, reject) {
    events.once("scrapecomplete", eventHandlers.scrapeComplete(resolve, reject));
  });

  log.info(`>>`, url); // useful to follow page navigation
  const { page, response } = await newTabToURL(browser, url);
  if (response && response.status() >= 300) {
    return new Error(`<< [ ${url} ] HTTP status code ${response.status()}`);
  }

  const results = await scrapeJob;
  if (results == void 0) {
    return new Error("Scrape Job returned `undefined`. Set return type on page controller to `null` to fix this error");
  }
  await page.close(); // save memory
  return results;
}

export { UserSettings };
export default scrape;
