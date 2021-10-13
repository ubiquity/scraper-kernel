import "source-map-support/register";
import dotenv from "dotenv";

dotenv.config();

import puppeteer from "puppeteer";
import settings from "./config";
import path from "path";

(async function scraper(args: typeof process.argv) {
  const { browser, page } = await browserSetup();
  const destination = new URL(args[2]);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    await page.goto(destination.href);
  }

  // await browser.close();
  // process.exit(0);
})(process.argv); // async wrapper and pass in cli args

async function browserSetup() {
  const browser = await puppeteer.launch(settings);
  const context = browser.defaultBrowserContext();
  const page: puppeteer.Page = await context.newPage();
  // browser.on("targetchanged", globalTargetChangedHandler);

  // @FIXME: TYPING HACK
  const accepted = async (target: puppeteer.Target | any) => globalTargetChangedHandler(target);

  const rejected = () => {
    throw new Error("Scrape logic selection timed out");
  };

  waitForEventWithTimeout(browser, "targetchanged", 10000)
    .then(accepted, rejected)
    .then(async (_module) => await _module.default(page))
    // .then(async () => await page.close())
    .then(() => console.trace("Scrape logic completed"));

  return { browser, page };
}

// This should execute the routine needed based on the page url.
function globalTargetChangedHandler(target: puppeteer.Target) {
  const url = target.url(); // https://coinmarketcap.com/cryptocurrency-category/
  const logic = importLogic(url);
  return logic;
}

function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }

  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  return import(pathTo);
}

//
//
//
function waitForEventWithTimeout(eventEmitter: puppeteer.Browser, event: string, timeout: number) {
  return new Promise(function (resolve, reject) {
    eventEmitter.on(event, listener);
    const timer = setTimeout(function () {
      eventEmitter.off(event, listener);
      reject(new Error("timeout"));
    }, timeout);

    function listener(browser: puppeteer.Browser) {
      clearTimeout(timer);
      eventEmitter.off(event, listener);
      resolve(browser);
    }
  });
}
