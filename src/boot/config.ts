import { BrowserLaunchArgumentOptions } from "puppeteer";
import dotenv from "dotenv";
dotenv.config();
export function setupConfig(args) {
  const config = {
    devtools: false,
    headless: isHeadless(args),
    defaultViewport: null,
    args: ["--lang=en-US,en;q=0.9"] as string[],
    cache: "../cache",
    executablePath: process.env.PUPPETEER_EXEC_PATH,
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
