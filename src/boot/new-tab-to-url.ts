import { Browser } from "puppeteer";
import { log } from "../logging";

export default async function newTabToURL(browser: Browser, url: string) {
  const destination = new URL(url);
  if (!destination.href) {
    throw new Error("No destination URL specified");
  }
  const page = await browser.newPage();

  const response = await page.goto(destination.href, { waitUntil: "networkidle2" }).catch((error) => {
    log.error(`Could not go to ${destination.href}`);
  });

  return { page, response };
}
