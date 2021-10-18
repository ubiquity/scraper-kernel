import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import { events } from "../../../../boot/browser-setup";
import { projectScrape } from "./project-scrape";

export async function delegateRequestsToProxies(browser: puppeteer.Browser, url: string, proxyList: string[], _page?: puppeteer.Page) {
  console.log(`setting up proxies for ${url}`);
  const proxy = proxyList.shift();
  if (!proxy) {
    throw new Error("No proxy available");
  }

  const timeout = 5000;
  console.log(`Connecting to "${url}" via "${proxy}"... timeout in ${timeout / 1000} seconds`);

  if (_page) {
    console.log(`\t...stopping page`);
    _page.evaluate(() => stop()); // dont think that does anything, seems to still load
  }
  const page = _page || (await browser.newPage());

  const timer = setTimeout(() => events.emit("proxytimeout", () => delegateRequestsToProxies(browser, url, proxyList, page)), timeout);

  useProxy(page as object, `http://${proxy}`);
  await page.goto(url);
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  clearTimeout(timer);

  const token = await projectScrape(page);
  return token;
}
