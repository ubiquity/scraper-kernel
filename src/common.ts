import fs from "fs";
import path from "path";
import puppeteer, { ElementHandle, Page } from "puppeteer";
import { events } from "./boot/browser-setup";
export type PageLogic = (browser: puppeteer.Browser) => Promise<unknown[]>;

export async function extractURLs(elements: ElementHandle<Element>[]) {
  const urls = [] as string[];
  for (const element of elements) {
    const href = await getProperty(element, "href");
    urls.push(href);
  }
  return urls;
}

export async function getProperty(element: ElementHandle, query: string) {
  const property = await element.getProperty(query);
  return (await property?.jsonValue()) as string;
}

export const getSourcedDate = () => new Date().toLocaleDateString();
export const getMarketCap = async (elements: ElementHandle<Element>[]) => {
  const mcaps = [] as string[];
  for (const element of elements) {
    const href = await getProperty(element, "textContent");
    mcaps.push(href);
  }
  return mcaps;
};

export const scrollToBottom = async (page: Page) => await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

export const handlers = {
  logicFailed: function logicFailedHandler(): (...args: any[]) => void {
    return async (url: string) => {
      console.error(`page logic load error at ${url}`);
    };
  },
  logicLoaded: function logicLoadedHandler(browser: puppeteer.Browser): (...args: any[]) => void {
    return async (logic: PageLogic) => await logic(browser);
  },
  browserOnTargetChanged: function browserOnTargetChangedHandler(): puppeteer.Handler<any> {
    return async (browser: puppeteer.Target) => {
      const url = browser.url();
      console.log(`Target changed to ${url}`);

      const logic = importLogic(url);
      const defaultExport = (await logic)?.default as PageLogic | undefined;

      if (!defaultExport) {
        events.emit("logicfailed", url);
        return;
      }

      const page = await browser.page();
      if (!page) {
        console.error(`No page found for ${url}`);
        return;
      } else {
        page.waitForNavigation({ waitUntil: "networkidle2" }).then(() => events.emit("logicloaded", defaultExport));
      }
    };
  },
};

export function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  const exists = fs.existsSync(pathTo);
  if (exists) {
    const logic = import(pathTo).catch(() => {
      console.error(`Import page logic error for ${selection}`);
    });
    return logic as Promise<Module>;
  }
}

interface Module {
  default?: Function;
}
