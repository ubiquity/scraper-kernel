import { Browser } from "puppeteer";
import { browserOnTargetChangedHandler } from "./events/browserOnTargetChanged";

export type PageLogic = (browser: Browser) => Promise<unknown[]>;

export const eventHandlers = {
  proxyTimeout: function proxyTimeoutHandler(_browser: Browser): (...args: any[]) => void {
    return function setupProxies(callback) {
      callback();
    };
  },
  logicLoaded: function logicLoadedHandler(browser: Browser): (...args: any[]) => void {
    return async (logic: PageLogic) => {
      return await logic(browser);
    };
  },
  // logicFailed: function logicFailedHandler(browser: Browser): (...args: any[]) => void {
  //   return async (logic: PageLogic) => {
  //     await browser.close();
  //     return process.exit(1);
  //   };
  // },

  scrapeComplete: function scrapeCompleteHandler(resolve: (value: string | PromiseLike<string>) => void) {
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
