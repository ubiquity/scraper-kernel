import dotenv from "dotenv";
import { BrowserConnectOptions } from "puppeteer";
dotenv.config();
const DEBUG_HEADFUL = process.env.DEBUG_HEADFUL as "true" | "false" | undefined;
let headful;
if (!DEBUG_HEADFUL) {
  headful = false;
} else {
  headful = JSON.parse(DEBUG_HEADFUL);
}
export default {
  devtools: false,
  headless: !headful,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;
