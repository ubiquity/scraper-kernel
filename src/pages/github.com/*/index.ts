import puppeteer from "puppeteer";
import scrape from "../../../scrape";
import { log, scrapeHrefsFromAnchors } from "../../../utils";
import scrapeTextNode from "../scrape-text-node";

export default async function gitHubProfileViewController(browser: puppeteer.Browser, page: puppeteer.Page) {
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
    return await scrapeReposOnOrganizationPage(page, browser);
  }
}

async function scrapeReposOnOrganizationPage(page, browser) {
  const repos = await scrapeHrefsFromAnchors(page, `#org-repositories a[data-hovercard-type="repository"]`);
  const contributors = (await scrape(repos, browser)) as string[]; //.catch((error) => error && log.error(`<< [ ${page.url()} ] caught error`));
  const flattened = contributors.flat(Infinity);
  const unique = [...new Set(flattened)];
  const scrapeReposOnOrganizationPageResults = await scrape(unique, browser);
  // console.log({ scrapeReposOnOrganizationPageResults });
  return scrapeReposOnOrganizationPageResults;
}

async function scrapePersonalProfile(page, contributions) {
  const profile = {
    username: await getUserName(page),
    name: await getUserFullName(page),
    contributions: contributions,
    twitter: await getTwitter(page),
    bio: await getBio(page),
  };
  // console.trace({ profile });
  // debugger;
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
  return trimmedOrNull(fullname);
}

async function getUserName(page) {
  const username = await scrapeTextNode(page, `.vcard-username`);
  return trimmedOrNull(username);
}

async function getBio(page) {
  const bio = await scrapeTextNode(page, `[data-bio-text]`);
  return trimmedOrNull(bio);
}

async function getTwitter(page) {
  let twitter = await scrapeTextNode(page, `[href*=twitter]`);
  twitter = twitter?.replace("@", ""); // remove @
  return trimmedOrNull(twitter);
}

function trimmedOrNull(value: string | null | undefined) {
  if (!value) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed?.length) {
    return trimmed;
  }
  return null;
}
