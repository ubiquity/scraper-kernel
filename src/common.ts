import { ElementHandle, Page } from "puppeteer";
export const getSourcedDate = () => new Date().toLocaleDateString();
export const scrollToBottom = async (page: Page) => await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
export async function getProperty(element: ElementHandle, query: string) {
  const property = await element.getProperty(query);
  return (await property?.jsonValue()) as string;
}
export const getAttributeValueFromElements = async (elements: ElementHandle<Element>[], query: string) => {
  const buffer = [] as string[];
  for (const element of elements) {
    const href = await getProperty(element, query);
    buffer.push(href);
  }
  return buffer;
};
export async function extractURLs(elements: ElementHandle<Element>[]) {
  const urls = [] as string[];
  for (const element of elements) {
    const href = await getProperty(element, "href");
    urls.push(href);
  }
  return urls;
}
