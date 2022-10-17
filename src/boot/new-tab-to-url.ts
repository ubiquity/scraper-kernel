import { Browser } from "puppeteer";

export default async function newTabToURL(browser: Browser, url: string) {
  const destination = new URL(url);
  if (!destination) {
    throw new Error("No destination URL specified");
  }
  const page = await browser.newPage();

  const response = await page.goto(destination.href);

  return { page, response };
}
