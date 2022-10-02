import fs from "fs";
import puppeteer from "puppeteer";
import { getActiveTab, getProperty } from "../../../utils";
export default async (browser: puppeteer.Browser) => {
  const page = await getActiveTab(browser);
  const githubSelector = `a[href*=git]`; // I noticed gitlab and etherscan links for source code
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
