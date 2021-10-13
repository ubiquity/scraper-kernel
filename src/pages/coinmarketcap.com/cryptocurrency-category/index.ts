import puppeteer, { ElementHandle } from "puppeteer";
export default async (page: puppeteer.Page) => {
  const navigationPromise = page.waitForNavigation({ waitUntil: "networkidle2" });
  // await page.setViewport({ width: 1918, height: 1592 });
  await navigationPromise;

  console.trace("ok");

  const list = await page.$(`ul.content`);
  if (!list) {
    throw new Error(`No list found`);
  } else {
    const urls = getInterestingURLs(list);
    console.log({ urls });
  }
};

async function getInterestingURLs(element: ElementHandle<Element>) {
  // const urls = [] as string[];

  async function getProperty(element: ElementHandle, property: string) {
    const p = await element.getProperty(property);
    return await p?.jsonValue();
  }

  const href = await getProperty(element, "href");
  return href;
  // const anchors = element.getElementsByTagName(`a`);
  // anchors?.length &&
  //   [...anchors].forEach((anchor) => {
  //     if (anchor.href.length) {
  //       urls.push(anchor.href);
  //     }
  //   });
  // return urls;
}
