import { EventEmitter } from "events";
import puppeteer from "puppeteer";
import { eventHandlers } from "./event-handlers";

export const events = new EventEmitter();

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser));
  events.on("proxytimeout", eventHandlers.proxyTimeout(browser));
  events.on("logicloaded", eventHandlers.logicLoaded(browser));
  // events.on("logicfailed", handlers.logicFailed());
  return browser;
}
