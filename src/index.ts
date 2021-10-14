import "source-map-support/register";
import dotenv from "dotenv";

dotenv.config();

import puppeteer from "puppeteer";
import settings from "./config";
import path from "path";
import fs from "fs";

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
    .then(async (_module) => {
      const pageLoad = page.waitForNavigation({ waitUntil: "networkidle2" });
      await pageLoad;
      return await _module.default(page, pageLoad);
    })
    // .then(async () => await page.close())
    .then((results) => {
      fs.writeFileSync(path.join(process.cwd(), "dist", "results.json"), JSON.stringify(results));
      console.trace(results);
    });

  return { browser, page };
}

// This should execute the routine needed based on the page url.
function globalTargetChangedHandler(target: puppeteer.Target) {
  const url = target.url();
  console.log(url);
  const logic = importLogic(url);
  return logic;
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
