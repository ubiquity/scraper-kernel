import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "../browser-setup";
import { PageLogic } from "../event-handlers";
import fs from "fs";

export function browserOnTargetChangedHandler(_browser: Browser): Handler<any> {
  return async (target: Target) => {
    const url = target.url();

    const logic = importLogic(url);
    const defaultExport = (await logic)?.default as PageLogic | undefined;

    if (!defaultExport) {
      console.log(`\t...No logic found for ${url}`);
      // target.page().then((page) => page?.close());
      // events.emit("logicfailed", url);
      return;
    }

    const page = await target.page();
    if (page) {
      page.waitForNavigation({ waitUntil: "networkidle2" }).then(() => events.emit("logicloaded", defaultExport));
    } else {
      console.error(`No page found for ${url}`);
      return;
    }
  };
}

function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
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
