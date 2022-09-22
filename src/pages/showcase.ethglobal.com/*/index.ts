import puppeteer from "puppeteer";
import { getPage } from "..";
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
