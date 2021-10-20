import { BrowserConnectOptions } from "puppeteer";

export default {
  // slowMo: 10,
  devtools: false,
  headless: process.env.DEBUG_HEADLESS || false,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
} as BrowserConnectOptions;
