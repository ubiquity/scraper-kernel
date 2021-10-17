import fs from "fs";
import path from "path";
import { Browser, Handler, Target } from "puppeteer";
import { events } from "./browser-setup";
import useProxy from "puppeteer-page-proxy";

type PageLogic = (browser: Browser) => Promise<unknown[]>;

import Proxies from "../proxies";

const proxyHandler = Proxies();

export const handlers = {
  // logicFailed: function logicFailedHandler(): (...args: any[]) => void {
  //   return async (url: string) => {
  //     console.error(`page logic load error at ${url}`);
  //   };
  // },
  logicLoaded: function logicLoadedHandler(browser: Browser): (...args: any[]) => void {
    return async (logic: PageLogic) => {
      await logic(browser);
    };
  },

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

      const proxies = await proxyHandler;
      const proxyList = proxies.storage.flattened;

      const page = await target.page();
      if (page) {
        const proxy = proxyList.shift();
        console.log(`Connected to ${url} via ${proxy}`);
        useProxy(page as object, `http://${proxy}`)
          .then(() => events.emit("logicloaded", defaultExport))
          .catch(() => page.waitForNavigation({ waitUntil: "networkidle2" }).then(() => events.emit("logicloaded", defaultExport)));
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
    const logic = import(pathTo).catch(() => {
      console.error(`Import page logic error for ${selection}`);
    });
    return logic as Promise<Module>;
  }
}

interface Module {
  default?: Function;
}
