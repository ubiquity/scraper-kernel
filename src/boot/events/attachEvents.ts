import { Browser } from "puppeteer";
import { events } from "../../scrape";
import { eventHandlers } from "../event-handlers";

export function attachEvents(browser: Browser) {
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser));
  events.on("proxytimeout", eventHandlers.proxyTimeout(browser));
  events.on("logicloaded", eventHandlers.logicLoaded(browser));
  // events.on("logicfailed", eventHandlers.logicFailed(browser));
  return browser;
}
