import { Browser } from "puppeteer";
import { getActiveTab } from "../../../utils";
import scrape from "../../../scrape";
import { scrapeHrefsFromAnchors } from "../../showcase.ethglobal.com";
export default async (browser: Browser) => {
  const page = await getActiveTab(browser);
  const hackathonUrls = await scrapeHrefsFromAnchors(page, `a[href^="/showcase/"]`);
  const results = await scrape(hackathonUrls, browser);
  return results;
};
