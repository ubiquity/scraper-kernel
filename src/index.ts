import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import "source-map-support/register";
import settings from "./config";

dotenv.config();

// const proxyHandler = await proxies();
// console.log(proxyHandler.storage.flattened);

(async function scraper(args: typeof process.argv) {
  const { browser, page } = await browserSetup();

  // @FIXME: TYPING HACK
  const accepted = async (target: puppeteer.Target | any) => globalTargetChangedHandler(target);

  const rejected = (reason: Error) => {
    throw reason;
  };

  waitForEventWithTimeout(browser, "targetchanged", 10000)
    .then(accepted, rejected)
    .then(loadLogicForPage(page))
    .then(saveResultsToDisk)
    .finally(tearDown(page, browser));

  const destination = new URL(args[2]);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    await page.goto(destination.href);
  }
})(process.argv); // async wrapper and pass in cli args

function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }

  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  const logic = import(pathTo).catch((err) => {
    throw new Error(`Page logic not found for ${selection}`);
  });
  return logic;
}

function waitForEventWithTimeout(eventEmitter: puppeteer.Browser, event: string, timeout: number) {
  return new Promise(function (resolve, reject) {
    eventEmitter.on(event, listener);
    const timer = setTimeout(function () {
      eventEmitter.off(event, listener);
      reject(new Error("Scrape logic selection timed out"));
    }, timeout);

    function listener(browser: puppeteer.Browser) {
      clearTimeout(timer);
      eventEmitter.off(event, listener);
      resolve(browser);
    }
  });
}

async function browserSetup() {
  const browser = await puppeteer.launch(settings);
  const context = browser.defaultBrowserContext();
  const page: puppeteer.Page = await context.newPage();
  return { browser, page };
}

function loadLogicForPage(page: puppeteer.Page): ((value: any) => any) | null | undefined {
  return async (_module) => {
    const pageLoad = page.waitForNavigation({ waitUntil: "networkidle2" });
    await pageLoad;
    return await _module.default(page, pageLoad);
  };
}

function saveResultsToDisk(results: any) {
  fs.writeFileSync(path.join(process.cwd(), "dist", "results.json"), JSON.stringify(results));
  console.trace(results);
}

function tearDown(page: puppeteer.Page, browser: puppeteer.Browser): (() => void) | null | undefined {
  return async () => {
    await page.close();
    await browser.close();
    process.exit(0);
  };
}

// This should execute the routine needed based on the page url.
function globalTargetChangedHandler(target: puppeteer.Target) {
  const url = target.url();
  console.log(url);
  const logic = importLogic(url);
  return logic;
}
