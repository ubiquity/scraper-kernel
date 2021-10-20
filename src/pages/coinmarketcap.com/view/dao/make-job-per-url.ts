import puppeteer from "puppeteer";
import { Job } from ".";
import { delegateRequestsToProxies } from "./delegate-requests-to-proxies";

export async function makeJobPerURL(url: string, browser: puppeteer.Browser, proxies: string[], jobs: Job[]) {
  let name = url.split("/")[url.split("/").length - 2] as string | undefined;
  name = name?.match(/[a-z]+/gim)?.shift();
  if (!name) {
    name = "default";
  }

  const namedJob = {
    [name]: function () {
      return delegateRequestsToProxies({ browser, url, proxies });
    },
  }[name];

  jobs.push(namedJob);
}
