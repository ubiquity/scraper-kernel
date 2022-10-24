import puppeteer from "puppeteer";
import scrape from "../../scrape";
import { scrapeHrefsFromAnchors } from "../../utils";

export default async function gitHubProfileViewController(browser: puppeteer.Browser, page: puppeteer.Page) {
    const links = await scrapeHrefsFromAnchors(page, `a`);
    const results = await scrape(links, browser)
    return results;
}