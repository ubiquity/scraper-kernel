import { Browser, Page } from "puppeteer";
import { disableCosmetics } from "../../../../../boot/events/browserOnTargetChanged";
import scrape from "../../../../../scrape";
import { scrapeHREFsFromSelectors } from "../../../../../utils/common";

export default async function allCoins(browser: Browser, page: Page) {
  const urls = await scrapeHREFsFromSelectors(page, "a");
  console.trace(urls);
  const coins = [...new Set(urls.filter((href) => href.startsWith("/en/coins/")))];
  return await scrape(coins);
}
