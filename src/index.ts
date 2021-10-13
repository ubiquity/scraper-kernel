import "source-map-support/register";
import dotenv from "dotenv";

dotenv.config();

import puppeteer from "puppeteer";
import settings from "./config";

(async function scraper(args: typeof process.argv) {
  const { browser, page } = await browserSetup();
  const destination = new URL(args[2]);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    await page.goto(destination.href);
  }

  await browser.close();
  process.exit(0);
})(process.argv); // async wrapper and pass in cli args

async function browserSetup() {
  const browser = await puppeteer.launch(settings);
  const context = browser.defaultBrowserContext();
  const page: puppeteer.Page = await context.newPage();
  browser.on("targetchanged", globalTargetChangedHandler);
  return { browser, page };
}

// This should execute the routine needed based on the page url.
function globalTargetChangedHandler(target: puppeteer.Target) {
  const url = target.url(); // https://coinmarketcap.com/cryptocurrency-category/
  console.log(url);
}
