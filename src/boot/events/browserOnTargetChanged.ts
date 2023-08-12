import path from "path";
import { Browser, Page, Target } from "puppeteer";
import { log } from "../../logging";
import { events } from "../../scrape";
import { searchForImport } from "./search-for-import";
import { PAGES_PATH } from "../../PAGES_PATH";

export function browserOnTargetChangedHandler() {
  return async function _browserOnTargetChangedHandler(target: Target) {
    const page = await target.page();
    if (!page) {
      return;
    }
    // await disableCosmetics(page);
    try {
      // log.info(`>> ${page.url()}`);
      await page.waitForNavigation({ waitUntil: "networkidle2" });
    } catch (error) {
      events.emit("logicfailed", error);
      return;
    }

    const scrapeCompletedCallback = new Promise(function scrapeCompleted(resolve, reject) {
      events.emit("logicloaded", logicLoadedCallback(page, resolve, reject));
    }).catch(function logicLoadedCallbackError(error: Error) {
      if (error) {
        log.error(error);
      } else {
        log.error("Unknown error");
      }
    });

    events.emit("scrapecomplete", scrapeCompletedCallback);
  };
}

// this breaks opening up metamask extension
// async function disableCosmetics(page: Page) {
//   await page.setRequestInterception(true);

//   page.on("request", (request) => {
//     switch (request.resourceType()) {
//       case "document":
//       case "script":
//       case "fetch":
//         request.continue();
//         break;
//       // case "stylesheet":
//       // case "image":
//       // case "media":
//       // case "font":
//       // case "texttrack":
//       // case "xhr":
//       // case "eventsource":
//       // case "websocket":
//       // case "manifest":
//       // case "other":
//       //   request.abort();
//       //   break;
//       default:
//         request.abort();
//     }
//   });
// }

function logicLoadedCallback(page: Page, resolve, reject) {
  return async function _logicLoadedCallback(browser: Browser) {
    const url = page.url();
    let importing = url.split("://").pop();
    if (!importing) {
      throw new Error("Page URL parse error");
    }
    importing = path.resolve(PAGES_PATH, importing); // initialize
    const logic = await fetchPageLogic();
    const results = logic(browser, page);
    return resolve(results);

    async function fetchPageLogic() {
      return await searchForImport(importing as string).catch(function _logicLoadedCallbackErrorCatch(error) {
        events.emit("logicfailed", error);
        return async function _logicLoadedCallbackErrorCatch_(error) {
          reject(error);
          throw error;
        };
      });
    }
  };
}
