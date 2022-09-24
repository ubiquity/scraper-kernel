import { ElementHandle, Page, Browser } from "puppeteer";

export const getSourcedDate = () => new Date().toLocaleDateString();

export const scrollToBottom = async (page: Page) => await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

export async function getProperty(element: ElementHandle, query: string) {
  const property = await element.getProperty(query);
  return (await property?.jsonValue()) as string;
}
export const getAttribute = async (elements: ElementHandle<Element>[], query: string) => {
  const values = [] as string[];
  for (const element of elements) {
    const href = await getProperty(element, query);
    values.push(href);
  }
  return values;
};

export async function getActiveTab(browser: Browser) {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  return page;
}
