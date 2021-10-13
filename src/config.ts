import Puppeteer from "puppeteer";

export default {
  devtools: false,
  headless: false,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
} as Puppeteer.BrowserConnectOptions;
