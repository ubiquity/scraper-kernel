import puppeteer from "puppeteer";
import { Browser, BrowserLaunchArgumentOptions } from "puppeteer";

export default async function browserSetup(config: BrowserLaunchArgumentOptions): Promise<Browser> {
  // config.browserURL = "http://127.0.0.1:9222";

  // const browser = await puppeteer.connect(config);
  // return browser;

  return await puppeteer.launch(config);
}
