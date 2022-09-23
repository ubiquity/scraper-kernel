import puppeteer from "puppeteer";
import { getPage } from "..";
import { getProperty } from "../../../common";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  const githubSelector = `a[href*=git]`; // I noticed gitlab and etherscan links for source code
  // const anchor = await page.waitForSelector(githubSelector, { timeout: 5000 }).catch((error) => console.error(`Couldn't find Git link`, error));
  const anchor = await page.$(githubSelector).catch((error) => console.error(`Couldn't find Git link`, error));
  if (anchor) {
    const href = await getProperty(anchor, "href");
    if (href) {
      console.log({ href });
      return href;
    }
  }
};
