import puppeteer from "puppeteer";
import scrape from "../../../../../scrape";
import { getActiveTab } from "../../../../../utils";
// gallery view default logic
import { scrapeHrefsFromAnchors } from "../../../../showcase.ethglobal.com";
// there's 84 pages as of 29 sep 2022
export default async (browser: puppeteer.Browser) => {
  // console.log(colorizeText(`>> [ ${__filename} ]`, "fgYellow"));
  const page = await getActiveTab(browser);
  const showcaseUrls = await scrapeHrefsFromAnchors(page, `a[href^="/showcase/"]`);
  const projectUrls = showcaseUrls.filter((element: string) => !element.includes("/page/")); // filter page links out
  projectUrls.push(showcaseUrls.pop() as string);
  const results = await scrape(projectUrls, browser, 2);

  return results;
};
