import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "../browser-setup";
import { PageLogic } from "../event-handlers";
import fs from "fs";

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
        .catch((error) => console.trace(error))
        // output return value from page logic module
        .then((out) => console.trace(out));
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
  // const current = path.join(process.cwd(), "dist", "pages", selection);
  const pageDir = path.join(__dirname, "..", "..", "..", "dist", "pages", selection);
  const pathTo = pageDir;
  const exists = fs.existsSync(pathTo);
  if (exists) {
    const logic = import(pathTo).catch((error) => {
      console.error(error);
      console.error(`Import page logic error for ${selection}`);
    });
    return logic as Promise<Module>;
  }
}
interface Module {
  default?: Function;
}
