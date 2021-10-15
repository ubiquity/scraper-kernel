import puppeteer from "puppeteer";

export default function newTabToURL(browser: puppeteer.Browser, url: string) {
  const destination = new URL(url);
  if (!destination) {
    throw new Error("No destination URL specified");
  } else {
    browser.newPage().then((page) => page.goto(destination.href, { waitUntil: "networkidle2" }));
  }
}
