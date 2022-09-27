import puppeteer from "puppeteer";
import { getActiveTab, getAttribute } from "../../../utils";
// this is likely to be dynamically loaded when looking at a specific repository, due to the nesting of the url
// e.g. https://github.com/ubiquity/dollar

const selectors = { contributors: `[data-hovercard-type="user"]:not([data-test-selector])` };

export default async (browser: puppeteer.Browser) => {
  const page = await getActiveTab(browser);
  const contributors = await page.$$(selectors.contributors);
  const hrefs = await getAttribute(contributors, "href");
  return hrefs;
};
