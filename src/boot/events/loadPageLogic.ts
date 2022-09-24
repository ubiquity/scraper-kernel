import path from "path";
import { PageLogic } from "../event-handlers";
import { recurseAttemptImport } from "./recurseAttemptImport";

import { recurseDirUp } from "./recurseDirUp";

export async function loadPageLogic(url: string): Promise<Promise<PageLogic>> {
  const destination = url.split("://").pop();
  if (!destination) {
    throw new Error("Page URL parse error");
  }

  return await recurseAttemptImport({
    destination,
    strategies: [
      (destination: string) => path.join(process.cwd(), "dist", "pages", destination),
      (destination: string) => path.dirname(destination),
      (destination: string) => path.join(destination, "*"), // falling back to importing wildcard directory "*/index.ts" or literally "*.ts"
    ],
    fallback: recurseDirUp, // falling back to recursively moving up until wildcard is found (importing wildcard directory "*/index.ts" or literally "*.ts")
  });
}
