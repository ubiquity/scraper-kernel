import { EventEmitter } from "events";
import puppeteer from "puppeteer";
import { handlers } from "./event-handlers";

export const events = new EventEmitter();

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);
  browser.on("targetchanged", handlers.browserOnTargetChanged(browser));
  events.on("logicloaded", handlers.logicLoaded(browser));
  // events.on("logicfailed", handlers.logicFailed());
  return browser;
}
