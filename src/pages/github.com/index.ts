import puppeteer from "puppeteer";
import { getActiveTab } from "../../utils";
import scrapeTextNode from "./scrape-text-node";
export default async (browser: puppeteer.Browser) => {
  const page = await getActiveTab(browser);

  return {
    username: await getUserName(page),
    name: await getUserFullName(page),
    contributions: await getContributions(page),
    twitter: await getTwitter(page),
    bio: await getBio(page),
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

async function getUserName(page) {
  const username = await scrapeTextNode(page, `.vcard-username`);
  return username?.trim();
}

async function getBio(page) {
  const value = await scrapeTextNode(page, `[data-bio-text]`);
  return value;
}

async function getTwitter(page) {
  const value = await scrapeTextNode(page, `[href*=twitter]`);
  return value?.replace("@", "");
}
