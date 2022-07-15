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

  const yearlyContributions = await page.$(`div.js-yearly-contributions h2`);

  if (!yearlyContributions) {
    throw new Error(`can not find yearly contributions div`);
  }
  const yearlyContributionsText = await yearlyContributions.getProperty("textContent");
  const yearlyContributionsTextParsed: string | undefined = await yearlyContributionsText?.jsonValue();
  if (!yearlyContributionsTextParsed) {
    throw new Error(`can not find parse yearly contributions div`);
  } else {
    const matched = yearlyContributionsTextParsed?.match(/[0-9]*/gim);
    if (matched) {
      const yearlyContributionsTextParsedNumbersOnly = Number(matched.join(``));
      return yearlyContributionsTextParsedNumbersOnly;
    }
  }
};
