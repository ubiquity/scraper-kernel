import puppeteer from "puppeteer";
import { Job } from ".";
import { delegateRequestsToProxies } from "./delegate-requests-to-proxies";

export async function makeJobPerURL(url: string, browser: puppeteer.Browser, proxyList: string[], jobs: Job[]) {
  let name = url.split("/")[url.split("/").length - 2] as string | undefined;
  name = name?.match(/[a-z]+/gim)?.shift();
  if (!name) {
    name = "default";
  }

  jobs.push(
    {
      [name]: function () {
        return delegateRequestsToProxies(browser, url, proxyList);
      },
    }[name]
  );
}
