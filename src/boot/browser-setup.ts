import puppeteer from "puppeteer";
import { Browser, BrowserLaunchArgumentOptions } from "puppeteer";

export default async function browserSetup(config: BrowserLaunchArgumentOptions): Promise<Browser> {
  return await puppeteer.launch(config);
}
