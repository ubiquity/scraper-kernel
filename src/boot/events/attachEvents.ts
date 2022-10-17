import { Browser } from "puppeteer";
import { eventEmitter } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(browser: Browser) {
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser));
  eventEmitter.on("proxytimeout", eventHandlers.proxyTimeout());
  eventEmitter.on("logicloaded", eventHandlers.logicLoaded(browser));
  eventEmitter.on("logicfailed", eventHandlers.logicFailed());
  return browser;
}
