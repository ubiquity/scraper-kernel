import puppeteer from "puppeteer";
import entryPoint from "../../scrape";
import fs from "fs";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  await debugLogging(page);
  const hackathonURLs = await getHackathonURLs(page);
  const results = await entryPoint(hackathonURLs, browser);
  console.log({ results });
  fs.writeFileSync("results.json", JSON.stringify(results));
  return results;
};

async function getHackathonURLs(page: puppeteer.Page) {
  const hackathons = await page.$$(`#event > div > a`);
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

export async function getPage(browser: puppeteer.Browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  return page;
}
