import { EventEmitter } from "events";
import puppeteer from "puppeteer";
import { handlers } from "../common";

export const events = new EventEmitter();

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);
  events.on("logicloaded", handlers.logicLoaded(browser));
  events.on("logicfailed", handlers.logicFailed());
  browser.on("targetchanged", handlers.browserOnTargetChanged());
  return browser;
}
