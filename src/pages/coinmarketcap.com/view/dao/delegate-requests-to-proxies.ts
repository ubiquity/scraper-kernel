import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import { events } from "../../../../boot/browser-setup";
import { JobResult } from "./index";
import { projectScrape } from "./project-scrape";

const proxyTimeout = 60000;

interface DelegateRequestsToProxiesOptions {
  browser: puppeteer.Browser;
  url: string;
  proxies: string[];
}
interface KillJob {
  timer: NodeJS.Timeout;
  page: puppeteer.Page;
}

async function killJob({ timer, page }: KillJob) {
  clearTimeout(timer);
  if (page) {
    await page.close().catch(() => {
      console.log("closed page");
    });
  }
  // return false;
  // this may cause a recursive loop reloading pages over and over
  // return delegateRequestsToProxies({ browser, url, proxies });
}

export async function delegateRequestsToProxies({ browser, url, proxies }: DelegateRequestsToProxiesOptions): Promise<JobResult> {
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
  const timer = setTimeout(() => events.emit("proxytimeout", () => killJob({ timer, page })), proxyTimeout);

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
    return killJob({ timer, page });
  }
}
