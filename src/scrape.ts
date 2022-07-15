import dotenv from "dotenv";
import { EventEmitter } from "events";
import "source-map-support/register";
import { attachEvents } from "./boot/events/attachEvents";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import newTabToURL from "./boot/new-tab-to-url";
dotenv.config();

export const events = new EventEmitter();

export default async function scrape(userInput: string) {
  const browser = await browserSetup(config); // Setup browser and listen for events
  attachEvents(browser);
  newTabToURL(browser, userInput);
  const promise = new Promise(magicMysteryPromise);
  return promise;
}

type ResolveFunction = (results: string) => void;

function magicMysteryPromise(resolve: ResolveFunction): void {
  events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
}
