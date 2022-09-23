import fs from "fs";
import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "../../scrape";
import { PageLogic } from "../event-handlers";

async function tryOrThrowEvent(logic) {
  try {
    return await logic();
  } catch (error) {
    return events.emit("logicfailed", error);
  }
}

export function browserOnTargetChangedHandler(_browser: Browser): Handler<any> {
  return async (target: Target) => {
    const url = target.url();
    const page = await target.page();
    if (!page) {
      // console.warn(`No page found for ${url} (perhaps this is an iframe?)`);
      return;
    }

    const logic = await tryOrThrowEvent(async () => await importLogic(url));
    const defaultExport = await tryOrThrowEvent(() => logic?.default as PageLogic | undefined);
    await tryOrThrowEvent(async () => {
      await page.waitForNavigation({ waitUntil: "networkidle2" });

      const callback = new Promise((resolve) => {
        events.emit("logicloaded", (browser: Browser) => {
          resolve(defaultExport(browser));
        });
      });

      return events.emit("scrapecomplete", callback); // TODO test to see if timeout strategy makes the most sense here
    });
  };
}

function importLogic(url: string) {
  // first it will try to find a direct match based on the URL and the /pages/ directory for a filename to dynamically load in the page logic
  // next it will fall back to an index.ts in the same folder
  // finally it will fallback to the first "*.ts" or "*/index.ts" it can find

  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const fullPath = path.join(process.cwd(), "dist", "pages", selection);
  const exists = fs.existsSync(fullPath);
  if (exists) {
    return loadFrom(fullPath, selection);
  } else {
    // falling back to importing index.ts in directory instead

    const directoryPath = path.dirname(fullPath);
    const exists = fs.existsSync(directoryPath);
    if (exists) {
      return loadFrom(directoryPath, selection);
    } else {
      // falling back to importing wildcard directory "*/index.ts" or literally "*.ts"
      const wildcardPath = path.join(directoryPath, "*");
      const exists = fs.existsSync(wildcardPath);
      if (exists) {
        return loadFrom(wildcardPath, selection);
      } else {
        // falling back to recursively moving up until wildcard is found (importing wildcard directory "*/index.ts" or literally "*.ts")
        // e.g.
        // ~/repos/ubiquity/scraper/dist/pages/showcase.ethglobal.com/hackmoney/xopts
        // can fallback to loading logic from
        // ~/repos/ubiquity/scraper/dist/pages/showcase.ethglobal.com/*
        return recurseDirUp(wildcardPath, selection);
      }
    }
  }
}

function loadFrom(newPath: string, selection: string) {
  const logic = import(newPath).catch((error) => {
    console.error(error);
    console.error(`Import page logic error for ${selection}`);
  });
  return logic as Promise<Module>;
}
function recurseDirUp(directory, selection) {
  const dirUp = path.join(directory, "..", "..", "*");
  const exists = fs.existsSync(dirUp);
  if (exists) {
    // const wildcard = path.join(dirUp, "*");
    return loadFrom(dirUp, selection);
  } else {
    return recurseDirUp(dirUp, selection);
  }
}

interface Module {
  default?: Function;
}
