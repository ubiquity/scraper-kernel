import path from "path";
import { Browser, Page, Target } from "puppeteer";
import scrape, { eventEmitter } from "../../scrape";
import { colorizeText, log } from "../../utils/common";
import { searchForImport } from "./search-for-import";
import getCurrentLine from "get-current-line";

import readCommandLineArgs from "../../cli-args";
const DISABLE_COSMETICS = readCommandLineArgs?.cosmetics;
// console.log({ DISABLE_COSMETICS });
export const browserOnTargetChangedHandler = (browser: Browser, blocker) => async (target: Target) => {
  const page = await target.page();
  if (!page) {
    return;
  }

  // if ("about:blank" == page.url()) {
  //   await page.waitForNavigation({ waitUntil: "load" });
  //   console.trace(page.url());
  // debugger;
  // eventEmitter.emit("logicfailed", error);
  // eventEmitter.emit("breakdown", page);
  // await page.close();
  // return null;
  // }

  try {
    // const navigation = page.waitForNavigation({ waitUntil: "networkidle2", timeout: 60000 });
    // await page.waitForNavigation({ waitUntil: "load" });
    if (DISABLE_COSMETICS) {
      await disableCosmetics(page);
    } else {
      await blocker.enableBlockingInPage(page);
    }

    eventEmitter.emit(
      "scrapecomplete",
      new Promise((resolve, reject) => {
        eventEmitter.emit("logicloaded", logicLoadedCallback(page, resolve, reject));
      })
    );
  } catch (error) {
    eventEmitter.emit("logicfailed", error);
    eventEmitter.emit("breakdown", page);
    // FIXME: temporary fallback address. Should go to next in scrape queue.
    // await scrape("https://api.inventum.digital/headers", browser);
  }
};

export async function disableCosmetics(page: Page) {
  // console.trace(`disabling cosmetics`);
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    switch (request.resourceType()) {
      case "document":
      case "script":
      case "fetch":
      case "xhr":
        request.continue();
        break;
      case "stylesheet":
      case "image":
      case "media":
      case "font":
      case "texttrack":
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
