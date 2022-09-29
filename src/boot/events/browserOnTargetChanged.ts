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
    await page.waitForNavigation({ waitUntil: "networkidle2" });
  } catch (error) {
    eventEmitter.emit("logicfailed", error);
  }

  const scrapeCompletedCallback = new Promise((resolve, reject) => {
    eventEmitter.emit("logicloaded", logicLoadedCallback(page, resolve, reject));
  }).catch((error: Error) => error && console.error(error));

  eventEmitter.emit("scrapecomplete", scrapeCompletedCallback);
};

function logicLoadedCallback(page: Page, resolve, reject) {
  return async function testingFunctionName(browser: Browser) {
    const url = page.url();
    let importing = url.split("://").pop();
    if (!importing) {
      throw new Error("Page URL parse error");
    }
    importing = path.resolve(process.cwd(), "dist", "pages", importing); // initialize

    const logic = await searchForImport(importing as string)
      // ERROR HANDLE
      .catch(function testingFunctionError2(error) {
        eventEmitter.emit("logicfailed", error);
        return async function testingFunctionError3(error) {
          reject(error);
          throw error;
        };
      });
    // ERROR HANDLE
    const results = logic(browser, page);
    return resolve(results);
  };
}
