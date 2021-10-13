import Puppeteer from "puppeteer";

// const screen = { width: 1280, height: 800 };
// config.settings.args = [`--window-size=${screen.width},${screen.height}`, `--disable-search-geolocation-disclosure`];

export default {
  devtools: false,
  headless: false,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
} as Puppeteer.BrowserConnectOptions;
