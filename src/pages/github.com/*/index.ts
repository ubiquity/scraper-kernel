import puppeteer from "puppeteer";
import { getActiveTab, getAttribute, colorizeText } from "../../../utils";
// this is likely to be dynamically loaded when looking at a specific repository, due to the nesting of the url
// e.g. https://github.com/ubiquity/dollar

const selectors = { contributors: `[data-hovercard-type="user"]:not([data-test-selector])` };

export default async function gitHubRepoView(browser: puppeteer.Browser, page: puppeteer.Page) {
  console.log(colorizeText("> github repo view", "fgWhite"));
  const contributors = await page.$$(selectors.contributors);
  const HREFs = await getAttribute(contributors, "href");
  return HREFs;
}
