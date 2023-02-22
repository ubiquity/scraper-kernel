import path from "path";
import { Browser, Page, Target } from "puppeteer";
import { log } from "../../logging";
import { events, UserSettings } from "../../scrape";
import { searchForImport } from "./search-for-import";

export const browserOnTargetChangedHandler = (_browser: Browser, settings: UserSettings) => async (target: Target) => {
  const page = await target.page();
  if (!page) {
    return;
  }
  // await disableCosmetics(page);
  try {
    await page.waitForNavigation({ waitUntil: "networkidle2" });
  } catch (error) {
    events.emit("logicfailed", error);
  }

  const scrapeCompletedCallback = new Promise((resolve, reject) => {
    events.emit("logicloaded", logicLoadedCallback(page, resolve, reject, settings));
  }).catch((error: Error) => error && console.error(error));

  events.emit("scrapecomplete", scrapeCompletedCallback);
};

// this breaks opening up metamask extension
async function disableCosmetics(page: Page) {
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    switch (request.resourceType()) {
      case "document":
      case "script":
      case "fetch":
        request.continue();
        break;
      // case "stylesheet":
      // case "image":
      // case "media":
      // case "font":
      // case "texttrack":
      // case "xhr":
      // case "eventsource":
      // case "websocket":
      // case "manifest":
      // case "other":
      //   request.abort();
      //   break;
      default:
        request.abort();
    }
  });
}

function logicLoadedCallback(page: Page, resolve, reject, settings: UserSettings) {
  const { pages } = settings;
  return async function _logicLoadedCallback(browser: Browser) {
    const url = page.url();
    let importing = url.split("://").pop();
    if (!importing) {
      throw new Error("Page URL parse error");
    }

    importing = path.resolve(pages, importing); // initialize

    const logic = await searchForImport(importing as string)
      // ERROR HANDLE
      .catch(function _logicLoadedCallbackErrorCatch(error) {
        events.emit("logicfailed", error);
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
