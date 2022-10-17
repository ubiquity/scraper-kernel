import dotenv from "dotenv";
import { BrowserConnectOptions } from "puppeteer";
import readCommandLineArgs from "../cli-args";
import { log } from "../utils";
dotenv.config();

const headful = readCommandLineArgs?.headful;

const config = {
  devtools: false,
  headless: !headful, //  || !_headful,
  defaultViewport: null,
  args: ["--lang=en-US,en;q=0.9"] as string[],
  cache: "../cache",
} as BrowserConnectOptions;

log.ok(JSON.stringify(config, null, "\t"));

export default config;
