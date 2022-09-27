import path from "path";
import { warn } from "../../utils";
import { PageLogic } from "../event-handlers";
import { DestinationStrategy, recurseAttemptImport } from "./recurseAttemptImport";

import { recurseDirUp } from "./recurseDirUp";

// recurse import strategies, in order.
let _strategies = [] as DestinationStrategy[];
resetStrategies();

// ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/* <====== missing
// ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/*
// ⚠ importing * <======= remove

export function resetStrategies() {
  // this is a hook to store the same strategies in memory until a successful import occurs.
  _strategies = [
    function direct(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page/2
      const pathTo = path.join(process.cwd(), "dist", "pages", destination); // filename matches exactly
      warn(`importing ${pathTo}`);
      return pathTo;
    },
    function currentDirWildcard(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page/*
      const pathTo = path.join(destination, "..", "*");
      warn(`importing ${pathTo}`);
      return pathTo;
    },
    function index(destination: string) {
      // ⚠ importing /Users/nv/repos/ubiquity/scraper/dist/pages/ethglobal.com/showcase/page
      const pathTo = path.dirname(destination);
      warn(`importing ${pathTo}`);
      return pathTo;
    },
  ];
}

export async function loadPageLogic(url: string): Promise<Promise<PageLogic>> {
  const importing = url.split("://").pop();
  if (!importing) {
    throw new Error("Page URL parse error");
  }

  return await recurseAttemptImport({
    importing,
    strategies: _strategies,
    fallback: recurseDirUp,
  });
}
