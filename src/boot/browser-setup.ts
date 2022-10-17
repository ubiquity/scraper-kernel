import puppeteer from "puppeteer";

import { fullLists, PuppeteerBlocker, Request } from "@cliqz/adblocker-puppeteer";
import fetch from "node-fetch";
// import * as puppeteer from "puppeteer";
import { promises as fs } from "fs";

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
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
  // await blocker.enableBlockingInPage(page);

  // blocker.on("request-blocked", (request: Request) => {
  //   console.log("blocked", request.url);
  // });

  // blocker.on("request-redirected", (request: Request) => {
  //   console.log("redirected", request.url);
  // });

  // blocker.on("request-whitelisted", (request: Request) => {
  //   console.log("whitelisted", request.url);
  // });

  // blocker.on("csp-injected", (request: Request) => {
  //   console.log("csp", request.url);
  // });

  // blocker.on("script-injected", (script: string, url: string) => {
  //   console.log("script", script.length, url);
  // });

  // blocker.on("style-injected", (style: string, url: string) => {
  //   console.log("style", style.length, url);
  // });

  // await page.goto(getUrlToLoad());

  return { blocker, browser };
}
