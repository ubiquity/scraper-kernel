import dotenv from "dotenv";

import { BrowserConnectOptions } from "puppeteer";
import readCommandLineArgs from "../cli-args";
dotenv.config();

export default {
  devtools: false,
  headless: isHeadful(),
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;

function isHeadful() {
  // the default settings are that the browser is headless (aka headful is false)
  // first we should check the command line arguments. if the user has passed in the --headful flag, then we should set headless to false (aka headful is true)
  const headful = readCommandLineArgs?.headful;
  if (headful) {
    return true;
  }
  // if the user has not passed in the --headful flag, then we should check the DEBUG_HEADFUL environment variable. if the user has set DEBUG_HEADFUL to true, then we should set headless to false (aka headful is true)
  const env = process.env.DEBUG_HEADFUL;
  if (env === "true") {
    return true;
  }
  return false;
}
