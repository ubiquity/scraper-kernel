import { Browser } from "puppeteer";
import { events, UserSettings } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(browser: Browser, settings: UserSettings) {
  const browserOnTargetChangedHandler = eventHandlers.setupBrowserOnTargetChanged(browser, settings);

  browser.on("targetchanged", browserOnTargetChangedHandler);
  events.on("logicloaded", eventHandlers.logicLoaded(browser));
  events.on("logicfailed", eventHandlers.logicFailed());
  // eventEmitter.on("proxytimeout", eventHandlers.proxyTimeout());
  return browser;
}
