import path from "path";
import { Browser, Page, Target } from "puppeteer";
import { eventEmitter } from "../../scrape";
import { colorizeText } from "../../utils";
import { searchForImport } from "./search-for-import";

export const browserOnTargetChangedHandler = (_browser: Browser) => async (target: Target) => {
  const page = await target.page();
  if (!page) {
    return;
  }
  try {
    const response = await page.waitForNavigation({ waitUntil: "networkidle2" }); // .catch((error) => eventEmitter.emit("logicfailed", error));
    console.trace("page navigated");
  } catch (error) {
    console.trace("page error");
    return eventEmitter.emit("logicfailed", error);
  }

  const scrapeCompletedCallback = new Promise((resolve, reject) => {
    eventEmitter.emit("logicloaded", logicLoadedCallback(page, resolve, reject));
  }).catch((error: Error) => error && console.error(error));

  console.trace();

  eventEmitter.emit("scrapecomplete", scrapeCompletedCallback);
};

export async function disableCosmetics(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    switch (request.resourceType()) {
      case "document":
      case "script":
      case "fetch":
        request.continue();
        break;
      case "stylesheet":
      case "image":
      case "media":
      case "font":
      case "texttrack":
      case "xhr":
      case "eventsource":
      case "websocket":
      case "manifest":
      case "other":
        request.abort();
        break;
      default:
        request.abort();
    }
  });
}

function logicLoadedCallback(page: Page, resolve, reject) {
  return async function _logicLoadedCallback(browser: Browser) {
    const url = page.url();
    let importing = url.split("://").pop();
    if (!importing) {
      throw new Error("Page URL parse error");
    }
    importing = path.resolve(process.cwd(), "dist", "pages", importing); // initialize

    const logic = await searchForImport(importing as string)
      // ERROR HANDLE
      .catch(function _logicLoadedCallbackErrorCatch(error) {
        eventEmitter.emit("logicfailed", error);
        return async function _logicLoadedCallbackErrorCatch_(error) {
          reject(error);
          throw error;
        };
      });
    // ERROR HANDLE
    const results = logic(browser, page);

    return resolve(results);
  };
}
