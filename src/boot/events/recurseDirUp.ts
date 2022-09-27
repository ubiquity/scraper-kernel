import fs from "fs";
import path from "path";
import { events } from "../../scrape";

const projectDirectory = process.cwd();

export async function recurseDirUp(directory: string, searchHistory?: string[]) {
  if (!searchHistory) {
    searchHistory = [] as string[];
  }
  const dirUp = path.join(directory, "..", "..", "*");
  searchHistory.push(dirUp);

  if (!dirUp.includes(projectDirectory)) {
    console.trace(searchHistory);
    return;
    // events.emit("logicfailed", new Error(`Page logic not found! Search history: ${searchHistory}`));
  }

  // console.log({
  //   dirUp: path.resolve(dirUp),
  //   cwd: process.cwd(),
  // });

  const exists = fs.existsSync(dirUp);
  if (exists) {
    searchHistory = [];
    return await import(dirUp);
  } else {
    return await recurseDirUp(dirUp);
  }
}
