import { Browser } from "puppeteer";
import newTabToURL from "../../boot/new-tab-to-url";

export default async function googlePageController(browser: Browser) {
  const { page } = await newTabToURL(browser, "https://www.google.com");
  const inputs = await page.$$("input");

  // read the button values from input
  return await Promise.all(
    inputs.map(async (input) => {
      return await input.evaluate((input) => input.value);
    })
  );
}
