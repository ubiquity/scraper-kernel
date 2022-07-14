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
  const contribs = await page.waitForSelector(`#js-contribution-activity`);
  console.log(contribs);
  return contribs;
};
