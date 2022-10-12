import puppeteer from "puppeteer";
import scrape from "../../../../scrape";
import { log, scrapeHrefsFromAnchors } from "../../../../utils";
import fs from "fs";
import path from "path";
// this is likely to be dynamically loaded when looking at a specific repository, due to the nesting of the url
// e.g. https://github.com/ubiquity/dollar

const selectors = {
  contributors: `[data-hovercard-type="user"]:not([data-test-selector])`,
  soleContributor: `[data-hovercard-url^="/users/"]`,
};

export default async function gitHubRepoView(browser: puppeteer.Browser, page: puppeteer.Page) {
  log.warn(`this is a repository`);
  const contributorURLs = await scrapeHrefsFromAnchors(page, selectors.contributors);
  let contributorURLsUnique = [...new Set(contributorURLs)];
  log.info(`contributors: ${contributorURLsUnique.length}`);
  if (!contributorURLsUnique.length) {
    const soleContributor = await page.waitForSelector(selectors.soleContributor);
    const href = await soleContributor?.evaluate((element) => (element as HTMLAnchorElement).href);
    log.info(`soleContributors: ${href}`);
    if (href) {
      contributorURLsUnique = [href];
    }
  }
  if (!contributorURLsUnique.length) {
    const errorMessage = `no contributors found on repo view?`;
    fs.writeFileSync(path.join(process.cwd(), "error.log"), `[ ${page.url()} ]: ${errorMessage}`);
    throw new Error(errorMessage);
  }
  // const HREFs = await getAttribute(contributors, "href");
  log.ok(contributorURLsUnique.join(", "));
  // await page.close();
  return await scrape(contributorURLsUnique, browser);
}
