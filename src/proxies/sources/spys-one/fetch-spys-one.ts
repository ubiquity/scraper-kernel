import fs from "fs";
import got from "got";
import path from "path";

export default async function fetchSpysOne() {
  const URL = "https://spys.me/proxy.txt";
  const FILENAME = path.join(process.cwd(), "dist", "spys-proxy.txt");
  const { body } = await got(URL);
  fs.writeFileSync(FILENAME, body);
  return body;
}
