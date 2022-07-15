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
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const pageDir = path.join(process.cwd(), "dist", "pages", selection);
  const pathTo = pageDir;
  const exists = fs.existsSync(pathTo);
  if (exists) {
    const logic = import(pathTo).catch((error) => {
      console.error(error);
      console.error(`Import page logic error for ${selection}`);
    });
    return logic as Promise<Module>;
  } else {
    // falling back to importing index.ts in directory instead
    const sliced = pathTo.slice(0, pathTo.lastIndexOf("/"));

    const logic = import(sliced).catch((error) => {
      console.error(error);
      console.error(`Import page logic error for ${selection}`);
    });
    return logic as Promise<Module>;
  }
}
interface Module {
  default?: Function;
}
