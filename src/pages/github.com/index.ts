import puppeteer from "puppeteer";
export default async (browser: puppeteer.Browser) => {
  const pages = await browser.pages();
  const page = pages[pages.length - 1];
  if (!page) {
    throw new Error("No page found");
  }

  await page.setRequestInterception(true);

  page.on("request", (request) => {
    console.log(">>", request.method(), request.url());
    request.continue();
  });

  page.on("response", async (response) => console.log("<<", response.status(), response.url()));
  console.trace({ url: page.url() });

  const one = await page.$(`div.js-yearly-contributions h2`);
  //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    @ts-ignore-error
  const textContent = await one.getProperty("textContent");
  //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    @ts-ignore-error
  const two = await textContent.jsonValue();
  //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    @ts-ignore-error
  return Number(two.match(/[0-9]*/gim).join(``));
};
