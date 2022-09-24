import { Browser, Target } from "puppeteer";
import { events } from "../../scrape";
import { failSafe } from "./failSafe";
import { loadPageLogic } from "./loadPageLogic";

export type PageLogicSignature = Promise<(browser: Browser) => string[]>;

export const browserOnTargetChangedHandler = (_browser: Browser) => async (target: Target) => {
  const url = target.url();
  const page = await target.page();
  if (!page) {
    // console.warn(`No page found for ${url} (perhaps this is an iframe?)`);
    return;
  }

  await failSafe(async () => {
    await page.waitForNavigation({ waitUntil: "networkidle2" });

    const scrapeCompletedCallback = new Promise((resolve) => {
      events.emit("logicloaded", async (browser: Browser) => {
        await failSafe(async () => {
          const pageLogic = await loadPageLogic(url);
          return resolve(pageLogic(browser));
        });
      });
    });

    events.emit("scrapecomplete", scrapeCompletedCallback);
  });
};
