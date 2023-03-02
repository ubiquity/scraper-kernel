import { BrowserLaunchArgumentOptions } from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
const executablePath = "/home/runner/work/scraper-parent-test/scraper-parent-test/chrome-linux/chrome";

console.log({ executablePath });

export function setupConfig(args) {
  const config = {
    devtools: false,
    headless: isHeadless(args),
    defaultViewport: null,
    args: ["--lang=en-US,en;q=0.9"] as string[],
    cache: "../cache",
    executablePath,
  } as BrowserLaunchArgumentOptions;

  if (args.chromium) {
    config.args = [...(config.args as string[]), ...args.chromium];
  }

  return config;
}

function isHeadless(args) {
  if (args.headful) {
    return !args.headful;
  }
}
