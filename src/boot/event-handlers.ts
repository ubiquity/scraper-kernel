import { Browser, Page } from "puppeteer";
import { JobResult } from "../scrape";
import { log } from "../utils";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";

export type PageLogic = (browser: Browser, page: Page) => Promise<string[]>;

export default function renderEventHandlers(pagesDirectory: string) {
  return {
    proxyTimeout: function proxyTimeoutHandler(_browser: Browser): (...args: any[]) => void {
      return function setupProxies(callback) {
        callback();
      };
    },
    logicLoaded: function logicLoadedHandler(browser: Browser): (...args: any[]) => void {
      return async function _logicLoadedHandler(logic: PageLogic, page: Page) {
        return await logic(browser, page);
      };
    },
    logicFailed: function logicFailedHandler(browser: Browser): (...args: any[]) => void {
      return function _logicFailedHandler(error: Error) {
        log.error(error.message);
      };
    },

    scrapeComplete: function scrapeCompleteHandler(resolve, reject) {
      return async function _scrapeCompleteHandler(results: JobResult) {
        if (!results) {
          reject("no results");
        }
        // console.trace({ results: await results });
        // debugger;
        return resolve(results);
      };
    },

    /**
     * This is the main handler that will be called when the browser navigates to any new page.
     * It will load the logic for the page and then call the logic.
     * @param browser the browser instance
     */
    browserOnTargetChanged: (browser: Browser) => browserOnTargetChangedHandler(browser, pagesDirectory),
  };
}

// export default renderEventHandlers;
