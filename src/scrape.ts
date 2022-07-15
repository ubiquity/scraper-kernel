import { EventEmitter } from "events";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import config from "./boot/config";
import { eventHandlers } from "./boot/event-handlers";
import { attachEvents } from "./boot/events/attachEvents";
import newTabToURL from "./boot/new-tab-to-url";

let _userInput: string;

browserSetup(config)
  .then((browser) => attachEvents(browser))
  .then((browser) => {
    console.log({ _userInput });
    newTabToURL(browser, _userInput);
  });

export default function scrape(userInput: string) {
  _userInput = userInput;
  const promise = new Promise(magicMysteryPromise);
  return promise;
}

type ResolveFunction = (results: string) => void;

export const events = new EventEmitter();

function magicMysteryPromise(resolve: ResolveFunction): void {
  events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
}
