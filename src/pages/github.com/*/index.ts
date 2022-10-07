import fs from "fs";
import puppeteer from "puppeteer";
import scrape from "../../../scrape";
import { log, scrapeHrefsFromAnchors } from "../../../utils";
import scrapeTextNode from "../scrape-text-node";
import GitHubUser from "./@types/users-USER";
import { GitHubClient } from "./api";

// github.com/*
const github = new GitHubClient();
export default async function githubPage(_browser: puppeteer.Browser, page: puppeteer.Page) {
  const pagePath = page.url().split("https://github.com/").pop();
  if (!pagePath) {
    throw new Error("page path couldn't be parsed");
  }
  // const proxies = await github.ready();
  // console.log((await proxies?.list)?.length);

  const profile = await github.profile(pagePath);

  if ("User" == profile.type) {
    const profileNoUrls = filterUrls(profile);
    writeToStorage(profileNoUrls, `profiles.csv`);
    return profileNoUrls; // User profile
  }

  if ("Organization" == profile.type) {
    // Scrape repositories in organization
    const repositories = await github.repositoriesFromOrganization(pagePath);
    console.log({ repositories });
    const users = [] as { [k: string]: any }[];

    for (const repository of repositories) {
      if (repository.fork) {
        // ignore forks
        continue;
      }
      const contributors = await github.contributorsFromRepository(repository.owner.login, repository.name);
      console.log({ contributors });
      for (const contributor of contributors) {
        const user = await github.profile(contributor.url);
        const userNoUrls = filterUrls(user);
        writeToStorage(userNoUrls, `profiles.csv`);
        users.push(userNoUrls);
      }
    }
    return users;
  }

  throw new Error(`unhandled profile type: "${profile.type}"`); // not user or organization
}

async function _githubPageDeprecated(browser: puppeteer.Browser, page: puppeteer.Page) {
  // @TODO: need to design best strategy to determine if this is a personal profile or organization view
  const contributions = await getContributions(page);

  if (contributions) {
    // If contributions are found, its likely to be a personal profile page.
    log.info(`this is a personal profile`);
    return await _scrapePersonalProfile(page, contributions);
  } else {
    // If no contributions are found, its likely to be an organization page.
    log.info(`this is an organization profile`);
    // const repositories = await github.repositoriesFromOrganization(ORGANIZATION);
    return await _scrapeReposOnOrganizationPage(page, browser);
  }
}

async function _scrapeReposOnOrganizationPage(page, browser) {
  const repos = await scrapeHrefsFromAnchors(page, `#org-repositories a[data-hovercard-type="repository"]`);
  const results = (await scrape(repos, browser)) as unknown; // @FIXME: standardize page scraper controller return data type
  if (typeof results != "string") {
    // results are probably scraped data
    return results;
  }
  const contributors = results as unknown as string[]; //.catch((error) => error && log.error(`<< [ ${page.url()} ] caught error`));
  const flattened = contributors.flat(Infinity);
  const unique = [...new Set(flattened)];
  const scrapeReposOnOrganizationPageResults = await scrape(unique, browser);
  return scrapeReposOnOrganizationPageResults;
}

async function _scrapePersonalProfile(page, contributions) {
  const USER_ID = await getUserName(page);
  if (!USER_ID) {
    throw new Error(`failed to fetch user id from github profile`);
  }

  const profile = await github.profile(USER_ID);
  if (!profile) {
    log.error("failed to fetch user profile from github api");
    const scraped = {
      username: await getUserName(page),
      name: await getUserFullName(page),
      contributions: contributions,
      twitter: await getTwitter(page),
      bio: await getBio(page),
    };
    writeToStorage(scraped, `profiles-scraped.csv`);
    return scraped; // Not sure if a good idea
  }

  writeToStorage(profile, `profiles-fetched.csv`);
  return profile;
}

function writeToStorage(profile: GitHubUser | { [key: string]: string | null }, FILENAME: string) {
  const values = Object.values(profile);
  const row = [
    new Date(),

    // page.url().replace("https://github.com/", "").split("/"), // page url
    values.map((value) => {
      if (value == null) {
        return value;
      }

      if (typeof value == "string") {
        if (value.includes(",") || value.includes("\n")) {
          value = `"${value}"`; // double quote escape for csvs
        }
      }

      return value;
    }),
  ].join(",");
  const fileExists = fs.existsSync(FILENAME);
  if (!fileExists) {
    // set spreadsheet headers
    const buffer = [`date`, ...Object.keys(profile)].join(",");
    fs.appendFile(FILENAME, buffer.concat("\n"), (error) => error && console.error(error));
  }
  // write row
  fs.appendFile(FILENAME, row.concat("\n"), (error) => error && console.error(error));
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

function filterUrls(profile: GitHubUser) {
  return Object.fromEntries(Object.entries(profile).filter(([key]) => !key.includes("url")));
}
