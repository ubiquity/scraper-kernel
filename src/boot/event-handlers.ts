import { Browser, Target } from "puppeteer";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";
import { eventEmitter } from "../scrape";
import { colorizeText } from "../utils";

export type PageLogic = (browser: Browser, target: Target) => Promise<string[]>;

export const eventHandlers = {
  proxyTimeout: function proxyTimeoutHandler(_browser: Browser): (...args: any[]) => void {
    return function setupProxies(callback) {
      callback();
    };
  },
  logicLoaded: function logicLoadedHandler(browser: Browser, target: Target): (...args: any[]) => void {
    return async function _logicLoadedHandler(logic: PageLogic) {
      return await logic(browser, target);
    };
  },
  logicFailed: function logicFailedHandler(browser: Browser): (...args: any[]) => void {
    return function _logicFailedHandler(error: Error) {
      throw error;
    };
  },

  scrapeComplete: function scrapeCompleteHandler(resolve) {
    // console.log(colorizeText(">> scrapeComplete();", "fgWhite"));
    // eventEmitter.off("scrapecomplete", eventHandlers.scrapeComplete); // remove event to stop memory leak
    return (results: string) => resolve(results);
  },

  /**
   * This is the main handler that will be called when the browser navigates to any new page.
   * It will load the logic for the page and then call the logic.
   * @param browser the browser instance
   */
  browserOnTargetChanged: browserOnTargetChangedHandler,
};
export default eventHandlers;
