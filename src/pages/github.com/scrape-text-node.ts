import puppeteer from "puppeteer";
export default async (page: puppeteer.Page, selector: string) => {
  const htmlElement = await page.$(selector);

  if (!htmlElement) {
    console.error(`<< selector not found`);
    return null;
  }
  const htmlElementTextNode = await htmlElement.getProperty("textContent");
  const text: string | undefined = await htmlElementTextNode?.jsonValue();
  return text;
};
