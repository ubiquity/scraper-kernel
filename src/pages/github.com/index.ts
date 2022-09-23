import puppeteer from "puppeteer";
import { getPage } from "../../common";
import getYearlyContributionsInteger from "./get-yearly-contributions-integer";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
  const contributions = await getYearlyContributionsInteger(page);
  return contributions;
};
