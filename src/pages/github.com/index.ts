import puppeteer from "puppeteer";
import { getActiveTab } from "../../common";
import scrapeTextNode from "./scrape-text-node";
export default async (browser: puppeteer.Browser) => {
  const page = await getActiveTab(browser);

  return {
    contributions: await getContributions(page),
    name: await getUserFullName(page),
  };
};

async function getContributions(page) {
  let contributions = await scrapeTextNode(page, `div.js-yearly-contributions h2`);
  const matched = contributions?.match(/[0-9]*/gim);
  if (matched) {
    contributions = matched.join(``);
  }
  return contributions;
}

async function getUserFullName(page) {
  const fullname = await scrapeTextNode(page, `.vcard-fullname`);
  return fullname?.trim();
}
