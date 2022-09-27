import { Browser, Target } from "puppeteer";
import { events } from "../../scrape";
import { loadPageLogic } from "./loadPageLogic";

export const browserOnTargetChangedHandler = (_browser: Browser) => async (target: Target) => {
  const url = target.url();
  const page = await target.page();
  if (!page) {
    return;
  }

  await page.waitForNavigation({ waitUntil: "networkidle2" });

  const scrapeCompletedCallback = new Promise((resolve, reject) => {
    events.emit("logicloaded", async (browser: Browser) => {
      const pageLogic = await loadPageLogic(url).catch((error) => {
        events.emit("logicfailed", error);
        return async (error) => {
          reject(error);
          throw error;
        };
      });
      const logic = pageLogic(browser);
      return resolve(logic);
    });
  });

  events.emit("scrapecomplete", scrapeCompletedCallback);
};
