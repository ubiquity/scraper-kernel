import puppeteer from "puppeteer";
import { getAttribute, log } from "../../../../utils";
// this is likely to be dynamically loaded when looking at a specific repository, due to the nesting of the url
// e.g. https://github.com/ubiquity/dollar

const selectors = {
  contributors: `[data-hovercard-type="user"]:not([data-test-selector])`,
  soleContributor: `[data-hovercard-url^="/users/"]`,
};

export default async function gitHubRepoView(browser: puppeteer.Browser, page: puppeteer.Page) {
  log.info(`this is a repository`);
  let contributors = await page.$$(selectors.contributors);
  log.info(`contributors: ${contributors.length}`);
  if (!contributors.length) {
    contributors = await page.$$(selectors.soleContributor);
    log.info(`soleContributors: ${contributors.length}`);
  }
  if (!contributors.length) {
    throw new Error(`no contributors found on repo view?`);
  }
  const HREFs = await getAttribute(contributors, "href");
  return HREFs;
}
