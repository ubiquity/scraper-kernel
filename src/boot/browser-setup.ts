import puppeteer, { Browser, BrowserConnectOptions } from "puppeteer";

import { fullLists, PuppeteerBlocker, Request } from "@cliqz/adblocker-puppeteer";
import fetch from "node-fetch";
import { promises as fs } from "fs";
import { log } from "../utils/common";

export default async function browserSetup(config: BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);

  const blocker = await PuppeteerBlocker.fromLists(
    fetch,
    fullLists,
    {
      enableCompression: true,
    },
    {
      path: "engine.bin",
      read: fs.readFile,
      write: fs.writeFile,
    }
  );

  // const page = await browser.newPage();

  // blocker.on("request-blocked", (request: Request) => log.warn(["blocked", request.url].join(" ")));
  // blocker.on("request-redirected", (request: Request) => log.warn(["redirected", request.url].join(" ")));
  blocker.on("request-whitelisted", (request: Request) => log.warn(["whitelisted", request.url].join(" ")));
  blocker.on("csp-injected", (request: Request) => log.warn(["csp", request.url].join(" ")));
  blocker.on("script-injected", (script: string, url: string) => log.warn(["script", script.length, url].join(" ")));
  // blocker.on("style-injected", (style: string, url: string) => log.warn(["style", style.length, url].join(" ")));
  return { blocker, browser };
}
