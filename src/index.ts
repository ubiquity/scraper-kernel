import dotenv from "dotenv";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import scraperBootload from "./boot/scraper-boot-load";
import scraperEventLoop from "./boot/scraper-event-loop";
import config from "./config";

dotenv.config();

const target = browserSetup(config);
scraperBootload(target);
scraperEventLoop(target);
