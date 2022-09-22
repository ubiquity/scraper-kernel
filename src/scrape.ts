import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

export default async function entryPoint(urls: string[], browser?: Browser) {
  if (!browser) {
    browser = await browserSetup(config);
    attachEvents(browser);
  }
  const completedScrapes = [] as unknown[];
  for (const url of urls) {
    completedScrapes.push(await scrapePage(url, browser));
  }
  return completedScrapes;
}

export async function scrapePage(userInput: string, browser: Browser) {
  const scrapeCompleted = new Promise(addCallbackEvent);
  console.log(`>>`, userInput);
  newTabToURL(browser, userInput);
  return await scrapeCompleted;
}

function addCallbackEvent(resolve: ResolveFunction): void {
  events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
}
type ResolveFunction = (results: string) => void;
export const events = new EventEmitter();
