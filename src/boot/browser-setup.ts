import puppeteer from "puppeteer";
import { Browser, BrowserConnectOptions } from "puppeteer";

export default async function browserSetup(config: BrowserConnectOptions): Promise<Browser> {
  return await puppeteer.launch(config);
}
