import { Browser } from "puppeteer";
import { eventEmitter, UserSettings } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(browser: Browser, settings: UserSettings) {
  const browserOnTargetChanged = eventHandlers.setupBrowserOnTargetChanged(browser, settings);

  browser.on("targetchanged", browserOnTargetChanged);
  eventEmitter.on("proxytimeout", eventHandlers.proxyTimeout());
  eventEmitter.on("logicloaded", eventHandlers.logicLoaded(browser));
  eventEmitter.on("logicfailed", eventHandlers.logicFailed());
  return browser;
}
