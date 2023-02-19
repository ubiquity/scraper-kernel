import dotenv from "dotenv";

import { BrowserConnectOptions } from "puppeteer";
dotenv.config();
export default {
  devtools: false,
  headless: isHeadless(global.DEBUG_HEADFUL),
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;

function isHeadless(headful?: boolean) {
  // the default settings are that the browser is headless (aka headful is false)
  // first we should check the command line arguments. if the user has passed in the --headful flag, then we should set headless to false (aka headful is true)
  if (headful) {
    return !headful;
  }
  // if the user has not passed in the --headful flag, then we should check the DEBUG_HEADFUL environment variable. if the user has set DEBUG_HEADFUL to true, then we should set headless to false (aka headful is true)
  const env = global.DEBUG_HEADFUL || process.env.DEBUG_HEADFUL;
  if (env === "true") {
    return false;
  }
  return true;
}
