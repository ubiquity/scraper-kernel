import fs from "fs";
import puppeteer, { Page } from "puppeteer";
import { getActiveTab, getProperty } from "../../../../utils";
// ethglobal.com/showcase default logic
export default async (browser: puppeteer.Browser) => {
  // console.log(colorizeText(`>> [ ${__filename} ]`, "fgYellow"));
  const page = await getActiveTab(browser);
  return await scrapeGit(page);
};

async function scrapeGit(page: Page) {
  const githubSelector = `a[href*=git]`; // I noticed gitlab and etherscan links for source code
  // const anchor = await page.waitForSelector(githubSelector, { timeout: 5000 }).catch((error) => console.error(`Couldn't find Git link`, error));
  const button = await page.$(githubSelector).catch((error) => error && console.error(`Couldn't find Git link`, error));

  if (button) {
    const githubUrl = await getProperty(button, "href");
    if (githubUrl && !githubUrl.includes("ethglobal")) {
      const row = [
        Date.now(), // timestamp
        page.url().replace("https://ethglobal.com/showcase/", "").split("/"), // page url
        githubUrl, // github url
      ].join(",");

      fs.appendFile("buffer.csv", row.concat("\n"), (error) => error && console.error(error));
      return githubUrl;
    }
  } else {
    return null;
  }
}
