import puppeteer from "puppeteer";
import { getProperty } from "../../../common";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  const githubSelector = `a[href*=github]`;
  const anchor = await page.waitForSelector(githubSelector);
  if (anchor) {
    const href = await getProperty(anchor, "href");
    if (href) {
      return href;
    }
  }
};

async function getPage(browser: puppeteer.Browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  return page;
}
