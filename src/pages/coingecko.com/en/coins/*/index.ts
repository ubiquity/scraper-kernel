import { Browser, Page } from "puppeteer";
import { scrapeHrefsFromAnchors } from "../../../../../utils";

export default async function coinPage(browser: Browser, page: Page) {
  const urls = await scrapeHrefsFromAnchors(page, "a");
  const gitHubUrls = [...new Set(urls.filter((href) => href.startsWith("https://github.com/")))];
  return gitHubUrls;
}
