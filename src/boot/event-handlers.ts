import fs from "fs";
import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "./browser-setup";

type PageLogic = (browser: Browser) => Promise<unknown[]>;

export default eventHandlers;
export const eventHandlers = {
  logicLoaded: function logicLoadedHandler(browser: Browser): (...args: any[]) => void {
    return async (logic: PageLogic) => {
      await logic(browser);
    };
  },

  /**
   * This is the main handler that will be called when the browser navigates to any new page.
   * It will load the logic for the page and then call the logic.
   * @param browser the browser instance
   */
  browserOnTargetChanged: function browserOnTargetChangedHandler(browser: Browser): Handler<any> {
    return async (target: Target) => {
      const url = target.url();

      const logic = importLogic(url);
      const defaultExport = (await logic)?.default as PageLogic | undefined;

      if (!defaultExport) {
        console.log(`\t...No logic found`);
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
