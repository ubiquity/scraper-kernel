import puppeteer from "puppeteer";
import scrape from "../../../../../scrape";
import { getActiveTab } from "../../../../../utils";
import { scrapeHrefsFromAnchors } from "../../../../showcase.ethglobal.com";
// ethglobal.com/showcase/page/ default logic
// there's 84 pages as of 29 sep 2022
export default async (browser: puppeteer.Browser) => {
  // console.log(colorizeText(`>> [ ${__filename} ]`, "fgYellow"));
  const page = await getActiveTab(browser);
  const showcaseUrls = await scrapeHrefsFromAnchors(page, `a[href^="/showcase/"]`);
  const projectUrls = showcaseUrls.filter((element: string) => !element.includes("/page/")); // filter page links out
  projectUrls.push(showcaseUrls.pop() as string);
  const results = await scrape(projectUrls, browser);

  return results;
};
