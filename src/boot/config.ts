import { BrowserLaunchArgumentOptions } from "puppeteer";
import dotenv from "dotenv";
import { log } from '../logging';
dotenv.config();

export function setupConfig(args) {
  const selectedExecutablePath = args.executablePath || process.env.PUPPETEER_EXECUTABLE_PATH;
  log.info({ selectedExecutablePath });
  let config = {
    devtools: false,
    headless: isHeadless(args),
    defaultViewport: null,
    args: ["--lang=en-US,en;q=0.9"] as string[],
    cache: "../cache",
    executablePath: selectedExecutablePath,
  } as BrowserLaunchArgumentOptions;

  if (selectedExecutablePath) {
    config = { ...config, executablePath: selectedExecutablePath } as BrowserLaunchArgumentOptions;
  }

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
