import { Browser, Page } from "puppeteer";
import { scrapeHREFsFromSelectors } from "../../../../../utils/common";

export default async function coinPage(browser: Browser, page: Page) {
  const urls = await scrapeHREFsFromSelectors(page, "a");
  const gitHubUrls = [...new Set(urls.filter((href) => href.startsWith("https://github.com/")))];
  return gitHubUrls;
}
