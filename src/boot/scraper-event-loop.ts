import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export default function scraperEventLoop(target: Promise<puppeteer.Target>) {
  globalTargetChangedHandler(target)
    .then(({ logic, page }) => runLogic({ logic, page })) //
    .then(saveResultsToDisk) //
    .catch((err) => {
      console.error(err);
      process.exit(1);
    })
    .finally(tearDown(target));
}

// This should execute the routine needed based on the page url.
// Should emit a custom event that will signal what URL to go to, and then make a new tab, navigate to that URL on a proxy.
async function globalTargetChangedHandler(target: Promise<puppeteer.Target>) {
  const url = (await target).url();
  const logic = importLogic(url);
  const page = (await target).browserContext().newPage();
  return { logic, page };
}

function importLogic(url: string): Promise<Function> {
  const selection = url.split("://").pop();
  if (!selection) {
    throw new Error("Page URL parse error");
  }

  const pathTo = path.join(process.cwd(), "dist", "pages", selection);
  const logic = import(pathTo).catch((err) => {
    throw new Error(`Page logic not found for ${selection}`);
  });
  return logic;
}

async function runLogic({ logic, page }: { logic: Promise<any>; page: Promise<puppeteer.Page> }) {
  const pageLoad = (await page).waitForNavigation({ waitUntil: "networkidle2" });
  await pageLoad;
  return (await logic).default(page, pageLoad);
}

function saveResultsToDisk(results: any) {
  fs.writeFileSync(path.join(process.cwd(), "dist", "results.json"), JSON.stringify(results));
  console.trace(results);
}

function tearDown(target: Promise<puppeteer.Target>): (() => void) | null | undefined {
  return async () => {
    const page = await (await target).page();
    await page?.close();
    (await target).browser().close();
    process.exit(0);
  };
}

function waitForEventWithTimeout(eventEmitter: puppeteer.Browser, event: string, timeout: number) {
  return new Promise(function (resolve, reject) {
    eventEmitter.on(event, listener);
    const timer = setTimeout(function () {
      eventEmitter.off(event, listener);
      reject(new Error("Scrape logic selection timed out"));
    }, timeout);

    function listener(browser: puppeteer.Browser) {
      clearTimeout(timer);
      eventEmitter.off(event, listener);
      resolve(browser);
    }
  });
}
