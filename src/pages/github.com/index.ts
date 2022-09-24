import puppeteer from "puppeteer";
import { getActiveTab } from "../../common";
import getYearlyContributionsInteger from "./get-yearly-contributions-integer";
export default async (browser: puppeteer.Browser) => {
  const page = await getActiveTab(browser);
  const contributions = await getYearlyContributionsInteger(page);
  return contributions;
};
