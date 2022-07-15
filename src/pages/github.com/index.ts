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

  const contributionsElement = await page.$(`div.js-yearly-contributions h2`);

  if (!contributionsElement) {
    throw new Error(`could not find the yearly contributions div`);
  }
  const contributionsElementTextNode = await contributionsElement.getProperty("textContent");
  const text: string | undefined = await contributionsElementTextNode?.jsonValue();
  if (!text) {
    throw new Error(`can not find parse yearly contributions div text`);
  } else {
    const matched = text.match(/[0-9]*/gim);
    if (matched) {
      const numbersInText = Number(matched.join(``));
      return numbersInText;
    }
  }
};
