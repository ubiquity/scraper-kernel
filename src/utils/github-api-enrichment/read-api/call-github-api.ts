import dotenv from "dotenv";
import { https } from "follow-redirects";
import { log } from "../../common";

dotenv.config();

const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

export default function readGitHubApi(path: string) {
  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "@ubiquity/scraper",
  } as { [key: string]: string };

  if (!GITHUB_PERSONAL_ACCESS_TOKEN?.length) {
    log.warn("no github personal access token found");
  } else {
    headers.Authorization = `Basic ${GITHUB_PERSONAL_ACCESS_TOKEN}`;
  }

  const options = {
    method: "GET",
    hostname: "api.github.com",
    path,
    headers,
    maxRedirects: 20,
  };

  return new Promise(function gitHubRequest(resolve, reject) {
    const req = https.request(options, function (res) {
      console.log(res.headers);
      const chunks = [] as Uint8Array[];

      res.on("data", function (chunk) {
        chunks.push(chunk);
      });

      res.on("end", function (_chunk: Uint8Array) {
        const body = Buffer.concat(chunks);
        const stringified = body.toString();
        try {
          resolve(JSON.parse(stringified));
        } catch (error) {
          resolve(stringified);
        }
      });

      res.on("error", function (error) {
        reject(error);
      });
    });

    req.end();
  });
}
