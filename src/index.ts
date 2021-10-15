import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import puppeteer from "puppeteer";
import "source-map-support/register";
import settings from "./config";

dotenv.config();

(async function scraper() {
  const { browser, page } = await browserSetup();
  scraperEventLoop(browser, page);
  await scraperBootload(page);
});

async function browserSetup() {
  const browser = await puppeteer.launch(settings);
  const context = browser.defaultBrowserContext();
  // TODO insert proxies here?
  // const proxyHandler = await proxies();
  // console.log(proxyHandler.storage.flattened);
  const page: puppeteer.Page = await context.newPage();
  return { browser, page };
}

async function scraperBootload(page: puppeteer.Page) {
  const destination = new URL(process.argv[2]);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    await page.goto(destination.href);
  }
}

function scraperEventLoop(browser: puppeteer.Browser, page: puppeteer.Page) {
  waitForEvent(browser, "targetchanged") //
    .then((target) => globalTargetChangedHandler(target)) //
    .then(runLogic(page)) //
    .then(saveResultsToDisk) //
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(tearDown(page, browser));
}

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

function waitForEvent(eventEmitter: puppeteer.Browser, event: string): Promise<puppeteer.Target> {
  return new Promise(function (resolve) {
    eventEmitter.on(event, function listener(browser: puppeteer.Browser) {
      eventEmitter.off(event, listener);
      // FIXME no idea why browser seemingly converts to target here but it works
      resolve(browser as unknown as puppeteer.Target);
    });
  });
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

function runLogic(page: puppeteer.Page): ((value: any) => any) | null | undefined {
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
async function globalTargetChangedHandler(target: puppeteer.Target) {
  const url = target.url();
  const logic = importLogic(url);
  return logic;
}
