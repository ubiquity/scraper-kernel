import puppeteer from "puppeteer";
export default async (browser: puppeteer.Browser) => {
  const page = await setupHackathonScraper(browser);
  const githubRepo = (await page.$(`a[href*=github]`)) as HTMLAnchorElement | null;

  if (githubRepo?.href) {
    console.log(githubRepo.href);
    return githubRepo.href;
  }
};

async function setupHackathonScraper(browser: puppeteer.Browser) {
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

  page.on("response", (response) => console.log("<<", response.status(), response.url()));
  return page;
}
