import puppeteer from "puppeteer";
import { getAttributeValueFromElements } from "../../../../common";

async function getMarketCaps(page: puppeteer.Page) {
  const marketCaps = await page.$$(`td:nth-child(7) span:last-child`);
  if (!marketCaps) {
    throw new Error(`No market caps found`);
  } else {
    const mcaps = await getAttributeValueFromElements(marketCaps, "textContent");
    return mcaps;
  }
}
