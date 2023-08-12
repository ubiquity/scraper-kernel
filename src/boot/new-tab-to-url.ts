import { Browser } from "puppeteer";
import { log } from "../logging";

export default async function newTabToURL(browser: Browser, url: string) {
  const destination = new URL(url);
  if (!destination.href) {
    throw new Error("No destination URL specified");
  }
  const page = await browser.newPage();
  const response = await page.goto(destination.href, { waitUntil: "networkidle2" }).catch(function newTabTimeoutError(err) {
    if (err) {
      log.error(err);
    }
  });
  return { page, response };
}
