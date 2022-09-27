import path from "path";
import { PageLogic } from "../event-handlers";
import { DestinationStrategy, recurseAttemptImport } from "./recurseAttemptImport";

import { recurseDirUp } from "./recurseDirUp";

// recurse import strategies, in order.
let _strategies = [] as DestinationStrategy[];
resetStrategies();

export function resetStrategies() {
  // this is a hook to store the same strategies in memory until a successful import occurs.
  _strategies = [
    function direct(destination: string) {
      return path.join(process.cwd(), "dist", "pages", destination); // filename matches exactly
    },
    function index(destination: string) {
      return path.dirname(destination); // falling back to importing wildcard directory "*/index.ts" or literally "*.ts"
    },
    function wildcard(destination: string) {
      return path.join(destination, "*"); // falling back to recursively moving up until wildcard is found (importing wildcard directory "*/index.ts" or literally "*.ts")
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
