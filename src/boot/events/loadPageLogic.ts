import path from "path";
import { PageLogic } from "../event-handlers";
import { searchForImport } from "./search-for-import";
import { colorizeText } from "../../utils";

export async function loadPageLogic(url: string): Promise<PageLogic> {
  let importing = url.split("://").pop();
  if (!importing) {
    throw new Error("Page URL parse error");
  }
  importing = path.resolve(process.cwd(), "dist", "pages", importing); // initialize
  console.log(colorizeText(`loading page logic for ${importing}`, "fgRed"));
  return await searchForImport(importing);
}
