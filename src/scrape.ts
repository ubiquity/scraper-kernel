import dotenv from "dotenv";
import { EventEmitter } from "events";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import newTabToURL from "./boot/new-tab-to-url";
dotenv.config();

export const events = new EventEmitter();

export default async function scrape(url: string): Promise<string> {
  const browser = await browserSetup(config); // Setup browser and listen for events
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser));
  events.on("proxytimeout", eventHandlers.proxyTimeout(browser));
  events.on("logicloaded", eventHandlers.logicLoaded(browser));
  return new Promise((resolve) => {
    events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
    // events.on("logicfailed", eventHandlers.logicFailed(browser));
    newTabToURL(browser, url); // Open new tab and load page
  });
}
