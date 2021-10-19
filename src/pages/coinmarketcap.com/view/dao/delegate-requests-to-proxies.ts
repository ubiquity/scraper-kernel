import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import ScrapedProject from "../../../../@types/scraped-project";
import { events } from "../../../../boot/browser-setup";
import { projectScrape } from "./project-scrape";

export async function delegateRequestsToProxies(browser: puppeteer.Browser, url: string, proxyList: string[], _page?: puppeteer.Page): Promise<ScrapedProject> {
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
  console.log(`timer ${timer} started`);
  useProxy(page as object, `http://${proxy}`);

  try {
    await page.goto(url);
  } catch (e) {
    _clearTimeout(timer);
  }
  await page.waitForNavigation({ waitUntil: "networkidle2" });
  try {
    const token = await projectScrape(page);
    _clearTimeout(timer);
    return token;
  } catch (e) {
    _clearTimeout(timer);
    return delegateRequestsToProxies(browser, url, proxyList, page);
  }
}

function _clearTimeout(timer: NodeJS.Timeout) {
  console.log(`timer ${timer} cleared`);
  clearTimeout(timer);
}
