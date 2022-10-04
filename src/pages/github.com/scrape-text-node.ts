import puppeteer from "puppeteer";
import { log } from "../../utils";
export default async function scrapeTextNode(page: puppeteer.Page, selector: string) {
  const htmlElement = await page.$(selector);

  if (!htmlElement) {
    log.warn(`"${selector}" not found`);
    return null;
  }
  const htmlElementTextNode = await htmlElement.getProperty("textContent");
  const text: string | undefined = await htmlElementTextNode?.jsonValue();
  return text;
}
