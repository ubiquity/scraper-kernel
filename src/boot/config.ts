import { BrowserLaunchArgumentOptions } from "puppeteer";

export function setupConfig(args) {
  const config = {
    executablePath: "/bin/google-chrome",
    devtools: false,
    headless: isHeadless(args),
    defaultViewport: null,
    args: ["--lang=en-US,en;q=0.9", "--no-sandbox"] as string[],
    cache: "../cache",
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
  return "new";
}
