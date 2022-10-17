import path from "path";
import { Browser, Page, Target } from "puppeteer";
import { eventEmitter } from "../../scrape";
import { searchForImport } from "./search-for-import";

export const browserOnTargetChangedHandler = (blocker, browser: Browser) => async (target: Target) => {
  const page = await target.page();
  if (!page) {
    return;
  } else {
    await blocker.enableBlockingInPage(page);
  }

  try {
    eventEmitter.emit(
      "scrapecomplete",
      new Promise((resolve, reject) => {
        eventEmitter.emit("logicloaded", logicLoadedCallback(page, resolve, reject));
      })
    );
  } catch (error) {
    eventEmitter.emit("logicfailed", error);
    eventEmitter.emit("breakdown", page);
  }
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

    const logic = await searchForImport(importing as string);

    const results = logic(browser, page);

    return resolve(results);
  };
}
