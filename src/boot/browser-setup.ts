import path from "path";
import puppeteer from "puppeteer";
import { EventEmitter } from "events";

type PageLogic = (browser: puppeteer.Browser) => Promise<unknown>;

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);

  browser.on("targetchanged", browserOnTargetChangedHandler());

  return browser;
}

function browserOnTargetChangedHandler(): puppeteer.Handler<any> {
  return async (browser) => {
    // I cant find the typing for Target, which also has URL, unlike puppeteer.Browser
    const url = browser.url();
    const logic = importLogic(url);
    const defaultExport = (await logic).default as PageLogic;
    const logicLoadedEvent = new EventEmitter();
    logicLoadedEvent.emit("logicloaded", defaultExport);
    return defaultExport;
  };
}

// function waitForEvent(eventEmittingObject: puppeteer.Browser, event: string): Promise<puppeteer.Target> {
//   return new Promise((resolve) => {
//     eventEmittingObject.on(event, function listener(target: puppeteer.Target) {
//       eventEmittingObject.off(event, listener);
//       // TODO seems that anything under the browser object
//       // can emit events but this is only designed for the target object.
//       resolve(target);
//     });
//   });
// }
export function importLogic(url: string) {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }
  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  const logic = import(pathTo).catch(() => {
    throw new Error(`Import page logic error for ${selection}`);
  });
  return logic;
}
