import puppeteer from "puppeteer";
import fs from "fs";
import { colorizeText, getActiveTab, getProperty } from "../../../../../utils";
export default async (browser: puppeteer.Browser) => {
  console.log(colorizeText(`DEEP`, "fgMagenta"));

  const page = await getActiveTab(browser);
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
};
