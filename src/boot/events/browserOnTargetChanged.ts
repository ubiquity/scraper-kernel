import fs from "fs";
import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "../../scrape";
import { PageLogic } from "../event-handlers";

export function browserOnTargetChangedHandler(_browser: Browser): Handler<any> {
  return async (target: Target) => {
    const url = target.url();

    const logic = await importLogic(url);
    const defaultExport = logic?.default as PageLogic | undefined;

    if (!defaultExport) {
      console.log(`\t...No logic found for ${url}`);
      // target.page().then((page) => page?.close());
      // events.emit("logicfailed", url);
      return;
    }

    const page = await target.page();
    if (page) {
      page
        .waitForNavigation({ waitUntil: "networkidle2" })
        // load page logic
        .then(async () => {
          return new Promise((resolve) => {
            events.emit("logicloaded", (browser: Browser) => {
              resolve(defaultExport(browser));
            });
          });
        })
        // log page logic errors
        .catch((error) => console.trace(error)) // TODO logicruntimeerror event
        // output return value from page logic module
        .then((out) => events.emit("scrapecomplete", out)); // TODO test to see if timeout strategy makes the most sense here
    } else {
      console.error(`No page found for ${url}`);
    }
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
      // const wildcard = directoryPath.slice(0, directoryPath.lastIndexOf("/"));
      const wildcardPath = path.join(directoryPath, "*");
      const exists = fs.existsSync(wildcardPath);
      if (exists) {
        return loadFrom(wildcardPath, selection);
      }
    }
  }
}

// function recurseDirUp(dirUp, selection) {
//   dirUp = path.join(dirUp, "..");
//   const exists = fs.existsSync(dirUp);
//   if (exists) {
//     return wildCardFallback(dirUp, selection);
//   } else {
//     return recurseDirUp(dirUp, selection);
//   }
// }

function loadFrom(newPath: string, selection: string) {
  const logic = import(newPath).catch((error) => {
    console.error(error);
    console.error(`Import page logic error for ${selection}`);
  });
  return logic as Promise<Module>;
}

// function wildCardFallback(sliced: string, selection: string) {
//   const wildcard = sliced.slice(0, sliced.lastIndexOf("/"));
//   const newPath = path.join(wildcard, "*");
//   const logic = import(newPath).catch((error) => {
//     console.error(error);
//     console.error(`Import page logic error for ${selection}`);
//   });
//   return logic as Promise<Module>;
// }

interface Module {
  default?: Function;
}
