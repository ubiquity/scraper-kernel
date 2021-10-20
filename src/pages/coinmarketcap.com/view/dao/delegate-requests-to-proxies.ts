import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import ScrapedProject from "../../../../@types/scraped-project";
import { events } from "../../../../boot/browser-setup";
import { projectScrape } from "./project-scrape";

const proxyTimeout = 60000;

interface DelegateRequestsToProxiesOptions {
  browser: puppeteer.Browser;
  url: string;
  proxies: string[];
}
interface RestartInterface extends DelegateRequestsToProxiesOptions {
  timer: NodeJS.Timeout;
  page: puppeteer.Page;
}

async function restart({ timer, browser, url, proxies, page }: RestartInterface) {
  clearTimeout(timer);
  if (page) {
    await page.close().catch(() => {
      console.log("closed page");
    });
  }
  // this may cause a recursive loop reloading pages over and over
  // return delegateRequestsToProxies({ browser, url, proxies });
}

export async function delegateRequestsToProxies({ browser, url, proxies }: DelegateRequestsToProxiesOptions): Promise<ScrapedProject | void> {
  let usingProxy = false;
  const proxy = proxies.shift();
  if (proxy) {
    usingProxy = true;
  }

  const usingProxyMessage = usingProxy ? ` via ${proxy}` : "";
  console.log(`Connecting to "${url}"${usingProxyMessage}... timeout in ${proxyTimeout / 1000} seconds`);

  const page = await browser.newPage();

  // start the page timeout timer
  // if the page doesn't load within the timeout, we'll try the next proxy
  const timer = setTimeout(() => events.emit("proxytimeout", () => restart({ timer, browser, url, proxies, page })), proxyTimeout);

  // enable the proxy
  if (usingProxy) {
    useProxy(page as object, `http://${proxy}`);
  }

  try {
    await page.goto(url);
    // scrape the page
    const token = await projectScrape(page);
    // success!
    clearTimeout(timer);
    return token;
  } catch (e) {
    // scrape failed, kill this proxy and try the next one
    // TODO this should proceed to the next url instead of just trying again on a new proxy
    return restart({ timer, browser, url, proxies, page });
  }
}
