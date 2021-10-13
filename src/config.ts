import Puppeteer from "puppeteer";

export default {
  devtools: false,
  headless: true,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
} as Puppeteer.BrowserConnectOptions;
