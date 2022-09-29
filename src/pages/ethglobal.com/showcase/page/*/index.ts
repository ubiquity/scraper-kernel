import puppeteer from "puppeteer";
import scrape from "../../../../../scrape";
import { colorizeText, getActiveTab } from "../../../../../utils";
import { scrapeHrefsFromAnchors } from "../../../../showcase.ethglobal.com";
export default async (browser: puppeteer.Browser) => {
  console.log(colorizeText(`>> [ ${__filename} ]`, "fgYellow"));
  const page = await getActiveTab(browser);
  const hackathonUrls = await scrapeHrefsFromAnchors(page, `a[href^="/showcase/"]`);
  const results = await scrape(hackathonUrls, browser);
  return results;
};
