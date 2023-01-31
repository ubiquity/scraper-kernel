import { Browser, Page } from "puppeteer";
import { JobResult } from "../scrape";
import { log } from "../utils";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";

export type PageLogic = (browser: Browser, page: Page) => Promise<string[]>;

export const eventHandlers = {
  proxyTimeout: function proxyTimeoutHandler() {
    return function setupProxies(callback) {
      callback();
    };
  },
  logicLoaded: function logicLoadedHandler(browser: Browser) {
    return async function _logicLoadedHandler(logic: PageLogic, page: Page) {
      return await logic(browser, page);
    };
  },
  logicFailed: function logicFailedHandler() {
    return function _logicFailedHandler(error: Error) {
      log.error(error.message);
    };
  },

  scrapeComplete: function scrapeCompleteHandler(resolve, reject) {
    return async function _scrapeCompleteHandler(results: JobResult) {
      if (!results) {
        return reject("no results");
      }
      return resolve(results);
    };
  },

  /**
   * This is the main handler that will be called when the browser navigates to any new page.
   * It will load the logic for the page and then call the logic.
   * @param browser the browser instance
   */
  // browserOnTargetChanged: browserOnTargetChangedHandler,
  setupBrowserOnTargetChanged: (browser, pagesDirectory) => browserOnTargetChangedHandler(browser, pagesDirectory),
};
export default eventHandlers;
