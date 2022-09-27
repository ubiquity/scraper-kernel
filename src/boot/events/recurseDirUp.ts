import fs from "fs";
import path from "path";
import { warn } from "../../utils";

const projectDirectory = process.cwd();

export async function recurseDirUp(directory: string) {
  const dirUp = path.join(directory, "..", "*");
  warn(`importing ${dirUp}`);

  if (!dirUp.includes(projectDirectory)) {
    return;
  }

  const exists = fs.existsSync(dirUp);
  if (exists) {
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
