import dotenv from "dotenv";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import newTabToURL from "./boot/scraper-boot-load";
import scraperEventLoop from "./boot/scraper-event-loop";
import config from "./config";

dotenv.config();
const homePage = process.argv[2];

browserSetup(config).then((browser) => newTabToURL(browser, homePage));
// console.trace({ browser });
// scraperEventLoop(browser);
