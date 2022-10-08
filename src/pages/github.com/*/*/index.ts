import puppeteer from "puppeteer";
import scrape from "../../../../scrape";
import { log, scrapeHrefsFromAnchors } from "../../../../utils";
// this is likely to be dynamically loaded when looking at a specific repository, due to the nesting of the url
// e.g. https://github.com/ubiquity/dollar

const selectors = {
  contributors: `[data-hovercard-type="user"]:not([data-test-selector])`,
  soleContributor: `[data-hovercard-url^="/users/"]`,
};

export default async function gitHubRepoView(browser: puppeteer.Browser, page: puppeteer.Page) {
  log.warn(`this is a repository`);
  let contributorURLs = await scrapeHrefsFromAnchors(page, selectors.contributors);
  log.info(`contributors: ${contributorURLs.length}`);
  if (!contributorURLs.length) {
    contributorURLs = await scrapeHrefsFromAnchors(page, selectors.soleContributor);
    log.info(`soleContributors: ${contributorURLs.length}`);
  }
  if (!contributorURLs.length) {
    throw new Error(`no contributors found on repo view?`);
  }
  // const HREFs = await getAttribute(contributors, "href");
  log.ok(contributorURLs.join(", "));
  // await page.close();
  return await scrape(contributorURLs, browser);
}
