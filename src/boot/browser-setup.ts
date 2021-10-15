import puppeteer from "puppeteer";

export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);
  return waitForEvent(browser, "targetchanged");
}

function waitForEvent(eventEmittingObject: puppeteer.Browser, event: string): Promise<puppeteer.Target> {
  return new Promise((resolve) => {
    eventEmittingObject.on(event, function listener(target: puppeteer.Target) {
      eventEmittingObject.off(event, listener);
      // TODO seems that anything under the browser object
      // can emit events but this is only designed for the target object.
      resolve(target);
    });
  });
}
