import puppeteer from "puppeteer";
import { getPage } from "../../../common";
export default async (browser: puppeteer.Browser) => {
  const page = await getPage(browser);
};
