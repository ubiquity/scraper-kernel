import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import ScrapedProject from "../../../../@types/scraped-project";
import { events } from "../../../../boot/browser-setup";
import { projectScrape } from "./project-scrape";

const proxyTimeout = 15000;
const totalTimeout = 180000;

interface DelegateRequestsToProxiesOptions {
  browser: puppeteer.Browser;
  url: string;
  proxyList: string[];
  _page?: puppeteer.Page;
}

export async function delegateRequestsToProxies({ browser, url, proxyList, _page }: DelegateRequestsToProxiesOptions): Promise<ScrapedProject | void> {
  const proxy = proxyList.shift();
  if (!proxy) {
    throw new Error("No proxy available");
  }

  console.log(`Connecting to "${url}" via "${proxy}"... timeout in ${proxyTimeout / 1000} seconds`);

  if (_page) {
    await _page.close();
  }
  const page = await browser.newPage();

  // start the page timeout timer
  // if the page doesn't load within the timeout, we'll try the next proxy
  const timer = setTimeout(() => events.emit("proxytimeout", () => restart({ timer, browser, url, proxyList, _page })), proxyTimeout);

  // enable the proxy
  useProxy(page as object, `http://${proxy}`);

  try {
    // navigate to the page
    await page.goto(url);
    // wait for the page to load
    await page.waitForNavigation({ waitUntil: "networkidle2", timeout: totalTimeout });
  } catch (e) {
    // page load failed, kill this proxy and try the next one
    restart({ timer, browser, url, proxyList, _page });
  }

  try {
    // scrape the page
    const token = await projectScrape(page);
    // success!
    clearTimeout(timer);
    return token;
  } catch (e) {
    // scrape failed, kill this proxy and try the next one
    // TODO this should proceed to the next url instead of just trying again on a new proxy
    restart({ timer, browser, url, proxyList, _page });
  }
}

interface RestartInterface extends DelegateRequestsToProxiesOptions {
  timer: NodeJS.Timeout;
}

function restart({ timer, browser, url, proxyList, _page }: RestartInterface) {
  clearTimeout(timer);
  return delegateRequestsToProxies({ browser, url, proxyList, _page });
}
