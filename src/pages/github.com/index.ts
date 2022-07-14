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

  const one = await page.$(
    `#js-pjax-container > div.container-xl.px-3.px-md-4.px-lg-5 > div > div.Layout-main > div:nth-child(2) > div > div.mt-4.position-relative > div > div.col-12.col-lg-10 > div.js-yearly-contributions > div:nth-child(1) > h2`
  );
  //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    @ts-ignore-error
  const two = await (await one.getProperty("textContent")).jsonValue();
  //    eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //    @ts-ignore-error
  return Number(two.match(/[0-9]*/gim).join(``));
};
