import fs from "fs";
import puppeteer from "puppeteer";
import scrape from "../../../scrape";
import { log, scrapeHREFsFromSelectors } from "../../../utils/common";
import {
  // getUpdated_at,
  getBio,
  getBlog,
  getCompany,
  getCreated_at,
  getEmail,
  // getPublic_gists,
  getFollowers,
  getFollowing,
  getLocation,
  getLogin,
  // getSite_admin,
  getName,
  getPublic_repos,
  // getHireable,
  getTwitter_username,
  // getId,
  // getNode_id,
  // getGravatar_id,
  getType,
  getCodeStyle,
  getContributions,
  getPercent,
} from "./profile";

export default async function gitHubProfileViewController(browser: puppeteer.Browser, page: puppeteer.Page) {
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
  const repos = await scrapeHREFsFromSelectors(page, `#org-repositories a[data-hovercard-type="repository"]`);
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

import { createClient } from "@supabase/supabase-js";
import { disableCosmetics } from "../../../boot/events/browserOnTargetChanged";

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl?.length) {
  throw new Error("no supabase url found");
}
const supabaseKey = process.env.SUPABASE_KEY;
if (!supabaseKey?.length) {
  throw new Error("no supabase key found");
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function scrapePersonalProfile(page, contributions) {
  const codeStyle = await getCodeStyle(page);

  const profile = {
    login: await getLogin(page),
    // id: await getId(page),
    // node_id: await getNode_id(page),
    // gravatar_id: await getGravatar_id(page),
    type: await getType(page, contributions),
    // site_admin: await getSite_admin(page),
    name: await getName(page),
    company: await getCompany(page),
    blog: await getBlog(page),
    location: await getLocation(page),
    email: await getEmail(page),
    // hireable: await getHireable(page),
    bio: await getBio(page),
    twitter_username: await getTwitter_username(page),

    // The underscore prefixed properties can not return data in the same format as the GitHub API.
    // It's an approximation because the numbers are truncated with "k" for thousands.

    _public_repos: await getPublic_repos(page),
    // public_gists: await getPublic_gists(page),
    _followers: await getFollowers(page),
    _following: await getFollowing(page),

    // This just looks for the oldest year on the timeline on the right side.

    _created_at: await getCreated_at(page),
    // updated_at: await getUpdated_at(page),

    contributions: await getContributions(page),

    percent_commits: getPercent("Commits", codeStyle),
    percent_issues: getPercent("Issues", codeStyle),
    percent_pull_requests: getPercent("Pull requests", codeStyle),
    percent_code_reviews: getPercent("Code review", codeStyle),
  };

  const bufferExists = fs.existsSync(`buffer.csv`);
  if (!bufferExists) {
    // set headers
    const buffer = [`date`, ...Object.keys(profile)].join(",");
    fs.appendFile(`buffer.csv`, buffer.concat("\n"), (error) => error && console.error(error));
  }

  const values = Object.values(profile);

  const row = [
    // new Date(), // timestamp
    // page.url().replace("https://github.com/", "").split("/"), // page url
    values.map((value) => {
      if (value == null) return value;
      if (value.includes(",") || value.includes("\n")) {
        value = `"${value}"`; // double quote escape for csvs
      }
      return value;
    }),
  ];

  fs.appendFile(`buffer.csv`, [new Date(), ...row].join(",").concat("\n"), (error) => error && console.error(error));

  // const response = await supabase.from("GitHub User").insert(profile);
  const response = await supabase.from("GitHub User").upsert(profile, { onConflict: "login" });
  if (response.error) {
    throw new Error(JSON.stringify(response.error));
  }
  // console.log(response); // { data, error }
  return profile;
}
