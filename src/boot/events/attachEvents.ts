import { Browser } from "puppeteer";
import { eventEmitter } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(browser: Browser, pagesDirectory: string) {
  const browserOnTargetChanged = eventHandlers.setupBrowserOnTargetChanged(browser, pagesDirectory);

  browser.on("targetchanged", browserOnTargetChanged);
  eventEmitter.on("proxytimeout", eventHandlers.proxyTimeout());
  eventEmitter.on("logicloaded", eventHandlers.logicLoaded(browser));
  eventEmitter.on("logicfailed", eventHandlers.logicFailed());
  return browser;
}
