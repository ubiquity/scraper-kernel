import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import scrape from "../../../../scrape";
import { getProperty, log } from "../../../../utils";
// project view default logic
export default async (browser: puppeteer.Browser, page: puppeteer.Page) => {
  const githubUrl = await scrapeGit(page).catch((error) => error && log.error(`Couldn't find GitHub link at ${page.url()}`));
  if (githubUrl) {
    return await scrape(githubUrl, browser);
  }
};

async function scrapeGit(page: Page) {
  const githubSelector = `a[href^="https://github.com/"]`; // Just scrape GitHub even though I noticed gitlab and etherscan links for "source code"

  // const button = await page.waitForSelector(githubSelector, { timeout: 1000 }).catch((error) => error && console.error(`Couldn't find GitHub link`, error));

  const button = await page
    .$(githubSelector)
    // .then((value) => value && log.ok(`GitHub link found`))
    .catch((error) => error && log.error(`Couldn't find GitHub link at ${page.url()}`));

  if (button) {
    const githubUrl = await getProperty(button, "href");
    const parsed = new URL(githubUrl);
    if (parsed.href && !githubUrl.includes("ethglobal")) {
      const row = [
        Date.now(), // timestamp
        page.url().replace("https://ethglobal.com/showcase/", "").split("/"), // page url
        parsed.href, // github url
      ].join(",");

      fs.appendFile("buffer.csv", row.concat("\n"), (error) => error && console.error(error));
      return parsed.href;
    }
  }
  return null;
}
