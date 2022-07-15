import puppeteer from "puppeteer";

export default async function browserSetup(config: puppeteer.BrowserConnectOptions): Promise<puppeteer.Browser> {
  return await puppeteer.launch(config);
}
