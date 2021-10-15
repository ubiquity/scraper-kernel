import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export default function scraperEventLoop(browser: Promise<puppeteer.Browser>) {
  // globalTargetChangedHandler(browser)
  // .then
  // ({ logic, page }) =>
  //   runLogic({ logic, page }) //
  //     .then(saveResultsToDisk) //
  //     .catch((err) => {
  //       console.error(err);
  //       process.exit(1);
  //     })
  //     .finally(tearDown(browser));
}

// // This should execute the routine needed based on the page url.
// // Should emit a custom event that will signal what URL to go to, and then make a new tab, navigate to that URL on a proxy.
// async function globalTargetChangedHandler(browser: Promise<puppeteer.Browser>) {
//   const url = await (await browser).target().pages()[0].url();
//   const logic = importLogic(url);
//   const page = (await browser).browserContext().newPage();
//   return { logic, page };
// }

// function saveResultsToDisk(results: any) {
//   fs.writeFileSync(path.join(process.cwd(), "dist", "results.json"), JSON.stringify(results));
//   console.trace(results);
// }

// function tearDown(target: Promise<puppeteer.Browser>): (() => void) | null | undefined {
//   return async () => {
//     const page = await (await target).page();
//     await page?.close();
//     (await target).browser().close();
//     process.exit(0);
//   };
// }

// function waitForEventWithTimeout(eventEmitter: puppeteer.Browser, event: string, timeout: number) {
//   return new Promise(function (resolve, reject) {
//     eventEmitter.on(event, listener);
//     const timer = setTimeout(function () {
//       eventEmitter.off(event, listener);
//       reject(new Error("Scrape logic selection timed out"));
//     }, timeout);

//     function listener(browser: puppeteer.Browser) {
//       clearTimeout(timer);
//       eventEmitter.off(event, listener);
//       resolve(browser);
//     }
//   });
// }
