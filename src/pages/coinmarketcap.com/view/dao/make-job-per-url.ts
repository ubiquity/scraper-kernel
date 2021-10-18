import puppeteer from "puppeteer";
import ScrapedProject from "../../../../@types/scraped-project";
import { dynamicallyNameFunction } from "./dynamically-name-function";
import { delegateRequestsToProxies } from "./delegate-requests-to-proxies";

export function makeJobPerURL(url: string, browser: puppeteer.Browser, proxyList: string[], jobs: (() => Promise<ScrapedProject>)[]) {
  let name = url.split("/")[url.split("/").length - 2] as string | undefined;
  name = name?.match(/[a-z]+/gim)?.shift();
  if (!name) {
    name = "default";
  }

  const namedFunction = dynamicallyNameFunction(name, () => delegateRequestsToProxies(browser, url, proxyList));
  const job = namedFunction;
  jobs.push(job);
}
