import dotenv from "dotenv";

import { BrowserConnectOptions } from "puppeteer";
import readCommandLineArgs from "../cli-args";
dotenv.config();
const DEBUG_HEADFUL = process.env.DEBUG_HEADFUL as "true" | "false" | undefined;
let _headful: boolean;
if (!DEBUG_HEADFUL) {
  _headful = false;
} else {
  _headful = JSON.parse(DEBUG_HEADFUL) as true | false;
}

export default {
  devtools: false,
  headless: !readCommandLineArgs?.headful || !_headful,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;
