import fs from "fs";
import got from "got";
import path from "path";
import { resolveProjectPath } from "../../../boot/events/search-for-import";

export default async function fetchSpysOne() {
  const URL = "https://spys.me/proxy.txt";
  const FILENAME = path.join(resolveProjectPath(), "dist", "spys-proxy.txt");
  const { body } = await got(URL);
  fs.writeFileSync(FILENAME, body);
  return body;
}
