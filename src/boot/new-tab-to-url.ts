import { Browser } from "puppeteer";

export default async function newTabToURL(browser: Browser, url: string) {
  const destination = new URL(url);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    const page = await browser.newPage();
    await page.goto(destination.href, { waitUntil: "networkidle2" });
  }
  return browser;
}
