import { Browser, Page } from "puppeteer";
import { log } from "../logging";
import { JobResult } from "../scrape";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";

export type PageLogic = (browser: Browser, page: Page) => Promise<string[]>;

export const eventHandlers = {
  /**
   * This is the main handler that will be called when the browser navigates to any new page.
   * It will load the logic for the page and then call the logic.
   * @param browser the browser instance
   */
  setupBrowserOnTargetChanged: (browser, settings) => browserOnTargetChangedHandler(browser, settings),

  logicLoaded: function logicLoadedHandler(browser: Browser) {
    return async function _logicLoadedHandler(logic: PageLogic, page: Page) {
      return await logic(browser, page);
    };
  },

  logicFailed: function logicFailedHandler() {
    return function _logicFailedHandler(error: Error) {
      log.error(error);
    };
  },

  scrapeComplete: function scrapeCompleteHandler(resolve, reject) {
    return async function _scrapeCompleteHandler(resultsPromise: Promise<JobResult>) {
      const results = await resultsPromise;
      if (results) {
        return resolve(results);
      } else {
        return reject("no results");
      }
    };
  },

  // proxyTimeout: function proxyTimeoutHandler() {
  //   return function setupProxies(callback) {
  //     callback();
  //   };
  // },
};
export default eventHandlers;
