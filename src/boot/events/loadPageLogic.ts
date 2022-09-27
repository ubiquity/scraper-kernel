import path from "path";
import { colorizeText } from "../../utils";
import { PageLogic } from "../event-handlers";
import { searchForImport } from "./search-for-import";

export function initalizeStrategies() {
  console.warn(colorizeText(`\t⚠ resetting strategies`, "fgYellow"));
  // this is a hook to store the same strategies in memory until a successful import occurs.
  return [
    function direct(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page/2
      // const pathTo = path.join(process.cwd(), "dist", "pages", destination); // filename matches exactly
      console.log(colorizeText(`\t⚠ importing ${destination}`, "fgGreen"));
      return destination;
    },
    function wildcard(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page/*
      const pathTo = path.join(destination, "..", "*");
      console.log(colorizeText(`\t⚠ importing ${pathTo}`, "fgGreen"));
      return pathTo;
    },
    function index(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page
      const pathTo = path.dirname(destination);
      console.log(colorizeText(`\t⚠ importing ${pathTo}`, "fgGreen"));
      return pathTo;
    },
    function up(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/
      const pathTo = path.join(destination, "..");
      console.log(colorizeText(`\t⚠ importing ${pathTo}`, "fgGreen"));
      return pathTo;
    },
  ];
}

export async function loadPageLogic(url: string): Promise<Promise<PageLogic>> {
  let importing = url.split("://").pop();
  if (!importing) {
    throw new Error("Page URL parse error");
  }
  importing = path.resolve(process.cwd(), "dist", "pages", importing); // initialize
  return await searchForImport({
    importing,
    strategies: initalizeStrategies(), // initialize
    index: 0,
  });
}
