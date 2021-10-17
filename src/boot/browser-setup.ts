import { EventEmitter } from "events";
import path from "path";
import puppeteer from "puppeteer";
interface Module {
  default?: Function;
}

export type PageLogic = (browser: puppeteer.Browser) => Promise<unknown[]>;
const logicLoadedEvent = new EventEmitter();

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);

  logicLoadedEvent.on("logicloaded", async (logic: PageLogic) => {
    console.log(`Loading "${logic}"`);
    return await logic(browser);
  });

  browser.on("targetchanged", browserOnTargetChangedHandler());
  return browser;
}

function browserOnTargetChangedHandler(): puppeteer.Handler<any> {
  return async (browser: puppeteer.Target) => {
    const url = browser.url();
    console.log(`Target changed to ${url}`);
    const logic = importLogic(url);
    const defaultExport = (await logic)?.default as PageLogic | undefined;
    if (!defaultExport) {
      logicLoadedEvent.emit("logicfailed", url);
      console.error(`No logic found for ${url}`);
    }

    // emitter().emit("logicloaded", defaultExport);
    logicLoadedEvent.emit("logicloaded", defaultExport);

    return defaultExport;
  };
}

export function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  const logic = import(pathTo).catch(() => {
    console.error(`Import page logic error for ${selection}`);
  });

  return logic as Promise<Module>;
}
