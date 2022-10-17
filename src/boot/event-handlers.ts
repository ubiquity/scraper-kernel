import { Browser, Page } from "puppeteer";
import { JobResult } from "../scrape";
import { log } from "../utils";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";

export type PageLogic = (browser: Browser, page: Page) => Promise<string[]>;

type HandlerFunction = {
  (browser: Browser): void;
};
type CurryFunction = {
  (...args: any[]): void;
};

export const eventHandlers = {
  proxyTimeout: function proxyTimeoutHandler(): CurryFunction {
    return function setupProxies(callback) {
      callback();
    };
  },
  logicLoaded: function logicLoadedHandler(browser: Browser): CurryFunction {
    return async function _logicLoadedHandler(logic: PageLogic, page: Page) {
      return await logic(browser, page);
    };
  },
  logicFailed: function logicFailedHandler(): CurryFunction {
    return function _logicFailedHandler(error: Error) {
      log.error(`logicFailed: "${error.message}"`);
      throw error;
    };
  },

  scrapeComplete: function scrapeCompleteHandler(resolve, reject) {
    console.trace();
    return async function _scrapeCompleteHandler(results: JobResult) {
      console.trace();
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
  browserOnTargetChanged: browserOnTargetChangedHandler,
};
export default eventHandlers;
