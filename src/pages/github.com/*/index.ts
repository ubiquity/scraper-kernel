import puppeteer from "puppeteer";
import scrape from "../../../scrape";
import { log, scrapeHrefsFromAnchors } from "../../../utils";
import scrapeTextNode from "../scrape-text-node";

export default async function (browser: puppeteer.Browser, page: puppeteer.Page) {
  // console.log(colorizeText("> github profile view", "fgWhite"));

  const contributions = await getContributions(page);

  // @TODO: need to design best strategy to determine if this is a personal profile or organization view
  if (contributions) {
    log.info(`this is a personal profile`);
    // If contributions are found, its likely to be a personal profile page.
    return await scrapePersonalProfile(page, contributions);
  } else {
    log.info(`this is an organization profile`);
    // If no contributions are found, its likely to be an organization page.
    return await openReposOnOrganizationPage(page, browser);
  }
}

async function openReposOnOrganizationPage(page, browser) {
  const repos = await scrapeHrefsFromAnchors(page, `#org-repositories a[data-hovercard-type="repository"]`);
  return await scrape(repos, browser).catch((error) => error && log.error(`<< [ ${page.url()} ] caught error`));
}

async function scrapePersonalProfile(page, contributions) {
  const profile = {
    username: await getUserName(page),
    name: await getUserFullName(page),
    contributions: contributions,
    twitter: await getTwitter(page),
    bio: await getBio(page),
  };
  console.log(profile);
  return profile;
}

async function getContributions(page) {
  let contributions = await scrapeTextNode(page, `div.js-yearly-contributions h2`);
  const matched = contributions?.match(/[0-9]*/gim);
  if (matched) {
    contributions = matched.join(``);
    return contributions;
  }
  return null;
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
