import puppeteer from "puppeteer";
import { getPage, getProperty } from "../../../common";
import fs from "fs";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  const githubSelector = `a[href*=git]`; // I noticed gitlab and etherscan links for source code
  // const anchor = await page.waitForSelector(githubSelector, { timeout: 5000 }).catch((error) => console.error(`Couldn't find Git link`, error));
  const button = await page.$(githubSelector).catch((error) => error && console.error(`Couldn't find Git link`, error));
  if (button) {
    const githubUrl = await getProperty(button, "href");
    if (githubUrl) {
      const row = [
        Date.now(), // timestamp
        page.url().replace("https://showcase.ethglobal.com/", "").split("/"), // page url
        githubUrl, // github url
      ].join(",");

      fs.appendFile("buffer.csv", row.concat("\n"), (error) => console.error(error));
      return githubUrl;
    }
  }
};
