import path from "path";
import scrape from "../../scraper-kernel/src/scrape"; // need to fix this

const urls = ["https://github.com/pavlovcik"];
const browser = undefined;
const PAGES_PATH = path.resolve("pages");

scrape(urls, browser, PAGES_PATH);
