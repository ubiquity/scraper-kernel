import { Browser, Page } from "puppeteer";
import scrape from "../../../../../scrape";
import { scrapeHrefsFromAnchors } from "../../../../../utils";

export default async function allCoins(browser: Browser, page: Page) {
  const urls = await scrapeHrefsFromAnchors(page, "a");
  const coins = [...new Set(urls.filter((href) => href.startsWith("/en/coins/")))];
  return await scrape(coins);
}
