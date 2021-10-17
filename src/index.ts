import dotenv from "dotenv";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import newTabToURL from "./boot/scraper-boot-load";
import config from "./config";

dotenv.config();
const homePage = process.argv[2];

browserSetup(config) // Setup browser and listen for events
  .then((browser) => newTabToURL(browser, homePage)) // Open new tab and load page
  .then((browser) => {
    console.trace();
    browser.close();
    process.exit(0); // Exit process
  });
