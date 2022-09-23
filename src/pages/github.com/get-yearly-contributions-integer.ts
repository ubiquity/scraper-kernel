import puppeteer from "puppeteer";
// import { getPage } from "../../common";
export default async (page: puppeteer.Page) => {
  // const page = await getPage(browser);

  // await page.setRequestInterception(true);

  // page.on("request", (request) => {
  //   console.log(">>", request.method(), request.url());
  //   request.continue();
  // });

  // page.on("response", (response) => console.log("<<", response.status(), response.url()));

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
