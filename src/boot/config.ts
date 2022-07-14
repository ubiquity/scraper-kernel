import { BrowserConnectOptions } from "puppeteer";
const headful = Boolean(process.env.DEBUG_HEADFUL);

export default {
  // slowMo: 10,
  devtools: false,
  headless: !headful,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;
