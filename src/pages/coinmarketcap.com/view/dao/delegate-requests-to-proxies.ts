import puppeteer from "puppeteer";
import useProxy from "puppeteer-page-proxy";
import ScrapedProject from "../../../../@types/scraped-project";
import { events } from "../../../../boot/browser-setup";
import { projectScrape } from "./project-scrape";

const proxyTimeout = 5000;
// const totalTimeout = 80000;

interface DelegateRequestsToProxiesOptions {
  browser: puppeteer.Browser;
  url: string;
  proxies: string[];
  _page?: puppeteer.Page;
}

export async function delegateRequestsToProxies({ browser, url, proxies, _page }: DelegateRequestsToProxiesOptions): Promise<ScrapedProject> {
  let usingProxy = false;
  const proxy = proxies.shift();
  if (proxy) {
    usingProxy = true;
  }

  const usingProxyMessage = usingProxy ? ` via ${proxy}` : "";
  console.trace(`Connecting to "${url}"${usingProxyMessage}... timeout in ${proxyTimeout / 1000} seconds`);

  if (_page) {
    console.log("closing page");
    await _page.close();
  }
  const page = await browser.newPage();

  // start the page timeout timer
  // if the page doesn't load within the timeout, we'll try the next proxy
  const timer = setTimeout(() => events.emit("proxytimeout", () => restart({ timer, browser, url, proxies, _page })), proxyTimeout);

  // enable the proxy
  if (usingProxy) {
    useProxy(page as object, `http://${proxy}`);
  }

  try {
    // navigate to the page
    await page.goto(url);
  } catch (e) {
    // page load failed, kill this proxy and try the next one
    return restart({ timer, browser, url, proxies, _page });
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
    return restart({ timer, browser, url, proxies, _page });
  }
}

interface RestartInterface extends DelegateRequestsToProxiesOptions {
  timer: NodeJS.Timeout;
}

function restart({ timer, browser, url, proxies, _page }: RestartInterface) {
  clearTimeout(timer);
  return delegateRequestsToProxies({ browser, url, proxies, _page });
}
