import puppeteer from "puppeteer";
import { scrapePage } from "../../scrape";
export default async (browser: puppeteer.Browser) => {
  const page = await setupHackathonScraper(browser);

  const hackathonURLs = await getHackathonURLs(page);
  let x = hackathonURLs.length;
  while (x--) {
    const url = hackathonURLs[x];
    // await page.goto(url, { waitUntil: "networkidle2" });
    await scrapePage(url, browser);
  }
};

async function getHackathonURLs(page: puppeteer.Page) {
  const hackathons = await page.$$(`#event > div > a`);
  if (!hackathons) {
    throw new Error(`could not find the hackthons`);
  }

  let x = hackathons.length;
  const hackathonURLs = [] as string[];
  while (x--) {
    const hackathon = hackathons[x];
    const href = await hackathon.evaluate((element) => (element as HTMLAnchorElement).href);
    hackathonURLs.push(href);
  }
  return hackathonURLs;
}

async function setupHackathonScraper(browser: puppeteer.Browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  await page.setRequestInterception(true);

  page.on("request", (request) => {
    console.log(">>", request.method(), request.url());
    request.continue();
  });

  page.on("response", (response) => console.log("<<", response.status(), response.url()));
  return page;
}
