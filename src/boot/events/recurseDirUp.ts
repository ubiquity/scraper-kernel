import fs from "fs";
import path from "path";

const projectDirectory = process.cwd();

export async function recurseDirUp(directory: string, searchHistory?: string[]) {
  if (!searchHistory) {
    searchHistory = [] as string[];
  }
  const dirUp = path.join(directory, "..", "..", "*");
  searchHistory.push(dirUp);

  console.log({ searchHistory });

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
    const logic = await import(dirUp);
    if (logic?.default) {
      return logic.default;
    } else {
      throw new Error(`${dirUp} requires a default export to work`);
    }
  } else {
    return await recurseDirUp(dirUp);
  }
}
