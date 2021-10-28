import dotenv from "dotenv";
dotenv.config();
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import newTabToURL from "./boot/new-tab-to-url";
import config from "./config";

export default async function scrape(homePage: string) {
  const browser = await browserSetup(config); // Setup browser and listen for events
  try {
    return newTabToURL(browser, homePage); // Open new tab and load page
  } catch (err) {
    console.error(err); // Log error
  }
}
