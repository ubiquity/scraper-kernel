// import { EventEmitter } from "events";
// import { Browser } from "puppeteer";
// import "source-map-support/register";
// import browserSetup from "./boot/browser-setup";
// import config from "./boot/config";
// import { eventHandlers } from "./boot/event-handlers";
// import { attachEvents } from "./boot/events/attachEvents";
// import newTabToURL from "./boot/new-tab-to-url";

// type ResolveFunction = (results: string) => void;
// export default class Scraper {
//   public async scrape(urls: string[] | string, browser?: Browser, concurrency?: number) {
//     browser = await this._attachEventsOnFirstRun(browser);

//     if (Array.isArray(urls)) {
//       if (concurrency) {
//         return await this._concurrently(urls, browser, concurrency);
//       }
//       return await this._series(urls, browser);
//     } else if (typeof urls === "string") {
//       return await this._scrapeSingle(urls, browser);
//     } else {
//       throw new Error("`urls` must be of types `string[] | string` ");
//     }
//   }

//   private async _series(urls: string[], browser: Browser) {
//     const completedScrapes = [] as unknown[];
//     for (const url of urls) {
//       completedScrapes.push(await this._scrapeSingle(url, browser));
//     }
//     return completedScrapes;
//   }

//   private async _concurrently(urls: string[], browser: Browser, concurrency?: number) {
//     const pendingScrapes = [] as Promise<unknown>[];
//     for (const url of urls) {
//       pendingScrapes.push(this._scrapeSingle(url, browser));
//     }

//     // const actions = [
//     // 	() => got('https://sindresorhus.com'),
//     // 	() => got('https://avajs.dev'),
//     // 	() => checkSomething(),
//     // 	() => doSomethingElse()
//     // ];

//     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
//     // @ts-expect-error

//     await (await import("p-all")).default(pendingScrapes, { concurrency: concurrency || 6 }); // http2 simultaneous connection limit?
//   }

//   private _events = new EventEmitter();

//   private _addCallbackEvent(resolve: ResolveFunction): void {
//     this._events.on("scrapecomplete", eventHandlers.scrapeComplete(resolve));
//   }

//   private async _scrapeSingle(url: string, browser: Browser) {
//     const scrapeCompleted = new Promise(this._addCallbackEvent);
//     console.log(`>>`, url); // useful to follow headless page navigation
//     const tab = await newTabToURL(browser, url);
//     const result = await scrapeCompleted;
//     await tab.close(); // save memory
//     return result;
//   }

//   private async _attachEventsOnFirstRun(browser: Browser | undefined) {
//     if (!browser) {
//       browser = await browserSetup(config);
//       attachEvents(browser);
//     }
//     return browser;
//   }
// }

// // const scraper = new Scraper();
// // const results = scraper.scrape(["test.html"]);
