import { Browser, Page } from "puppeteer";
import { disableCosmetics } from "../../../../boot/events/browserOnTargetChanged";
import scrape from "../../../../scrape";

// https://github.com/orgs/*/repositories
// Just navigate a page up to
// https://github.com/orgs/*
export default async (browser: Browser, page: Page) => {
  await disableCosmetics(page);
  const url = page.url() as string;
  const parts = url.split("/");
  parts.pop(); // remove last part of url
  const pageUp = parts.join("/");
  return await scrape(pageUp, browser);
  // console.trace();
};
