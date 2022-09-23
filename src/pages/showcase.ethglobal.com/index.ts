import puppeteer from "puppeteer";
import { getPage } from "../../common";
import scrapeUrlsInSeries from "../../scrape";

export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  // await debugLogging(page);
  const hackathonUrls = await scrapeHrefsFromAnchors(page, `#event > div > a`);
  const results = await scrapeUrlsInSeries(hackathonUrls, browser);

  return results;
};

export async function scrapeHrefsFromAnchors(page: puppeteer.Page, selectors: string) {
  const hackathons = await page.$$(selectors);
  if (!hackathons) {
    throw new Error(`could not find the hackathons`);
  }

  const hackathonURLs = [] as string[];
  for (const hackathon of hackathons) {
    const href = await hackathon.evaluate((element) => (element as HTMLAnchorElement).href);
    hackathonURLs.push(href);
  }
  return hackathonURLs;
}

async function debugLogging(page: puppeteer.Page) {
  await page.setRequestInterception(true);

  page.on("request", (request) => {
    console.log(">>", request.method(), request.url());
    request.continue();
  });

  page.on("response", (response) => console.log("<<", response.status(), response.url()));
}
