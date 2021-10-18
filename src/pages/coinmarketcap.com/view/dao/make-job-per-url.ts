import puppeteer from "puppeteer";
import { dynamicallyNameFunction } from "./dynamically-name-function";
import { delegateRequestsToProxies } from "./delegate-requests-to-proxies";
import { Job } from ".";

export function makeJobPerURL(url: string, browser: puppeteer.Browser, proxyList: string[], jobs: Job[]) {
  let name = url.split("/")[url.split("/").length - 2] as string | undefined;
  name = name?.match(/[a-z]+/gim)?.shift();
  if (!name) {
    name = "default";
  }
  const unnamedJob = async () => await delegateRequestsToProxies(browser, url, proxyList);

  const namedFunction = dynamicallyNameFunction(name, unnamedJob);
  const job = namedFunction;
  jobs.push(() => job);
}
