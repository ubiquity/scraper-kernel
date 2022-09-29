import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import scrape from "../../../../scrape";
import { getActiveTab, getProperty } from "../../../../utils";
// project view default logic
export default async (browser: puppeteer.Browser, page: puppeteer.Page) => {
  const githubUrl = await scrapeGit(page);
  if (githubUrl) {
    return await scrape(githubUrl, browser);
  }
};

async function scrapeGit(page: Page) {
  const githubSelector = `a[href^="https://github.com/"]`; // Just scrape GitHub even though I noticed gitlab and etherscan links for "source code"
  // const anchor = await page.waitForSelector(githubSelector, { timeout: 5000 }).catch((error) => console.error(`Couldn't find Git link`, error));
  const button = await page.$(githubSelector).catch((error) => error && console.error(`Couldn't find Git link`, error));

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
  } else {
    return null;
  }
}
