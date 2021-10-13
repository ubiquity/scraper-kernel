import "source-map-support/register";
import dotenv from "dotenv";

dotenv.config();

import puppeteer from "puppeteer";
import settings from "./config";

async function scraper(args: typeof process.argv) {
  const { page, browser } = await browserSetup();
  const destination = new URL(args[2]);
  await page.goto(destination.href);
  await page.close();
  await browser.close();
  process.exit(0);
}

scraper(process.argv);

async function browserSetup() {
  const browser = await puppeteer.launch(settings);
  const context = browser.defaultBrowserContext();
  const page: puppeteer.Page = await context.newPage();
  return { page, browser };
}
