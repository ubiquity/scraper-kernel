import getCurrentLine from "get-current-line";
import { Browser, Page, Target } from "puppeteer";
import { eventEmitter, JobResult } from "../scrape";
import { log } from "../utils/common";
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
      log.error(`logicFailedError at: ${getThisLine()}`);
      // throw error;
    };

    function makeCurrentLine(diagnostics) {
      return [
        diagnostics.file,
        ":",
        diagnostics.line,
        // , ":", diagnostics.char
      ].join("");
    }
    function getThisLine() {
      return makeCurrentLine(getCurrentLine({ frames: 4 }));
    }
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
  browserOnTargetChanged: browserOnTargetChangedHandler,
  breakdown: function breakdownJobHandler(browser: Browser) {
    // close tab etc
    return async function _breakdownJobHandler(page: Page) {
      log.warn(`breaking down ${page.url()}`);
      await page.close(); // save memory
    };
  },
};
export default eventHandlers;
