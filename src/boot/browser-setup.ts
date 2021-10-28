
import puppeteer from "puppeteer";



export default async function browserSetup(config: puppeteer.BrowserConnectOptions) {
  const browser = await puppeteer.launch(config);

  return browser;
}
