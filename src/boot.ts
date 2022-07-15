import dotenv from "dotenv";
import { EventEmitter } from "events";
import { Browser } from "puppeteer";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
dotenv.config();

export const events = new EventEmitter();

export default async function boot(url: string): Promise<Browser> {
  const browser = await browserSetup(config); // Setup browser and listen for events
  browser.on("targetchanged", eventHandlers.browserOnTargetChanged(browser));
  events.on("proxytimeout", eventHandlers.proxyTimeout(browser));
  events.on("logicloaded", eventHandlers.logicLoaded(browser));
  return browser;
}
