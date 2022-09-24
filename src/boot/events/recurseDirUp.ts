import fs from "fs";
import path from "path";

export async function recurseDirUp(directory: string) {
  const dirUp = path.join(directory, "..", "..", "*");
  const exists = fs.existsSync(dirUp);
  if (exists) {
    return await import(dirUp);
  } else {
    return await recurseDirUp(dirUp);
  }
}
