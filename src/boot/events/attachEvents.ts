import { Browser } from "puppeteer";
import { eventEmitter } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(blocker, browser: Browser) {
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser, blocker));
  eventEmitter.on("proxytimeout", eventHandlers.proxyTimeout());
  eventEmitter.on("logicloaded", eventHandlers.logicLoaded(browser));
  eventEmitter.on("logicfailed", eventHandlers.logicFailed());
  eventEmitter.on("breakdown", eventHandlers.breakdown(browser));
  return browser;
}
