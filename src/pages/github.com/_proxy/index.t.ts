import http from "http";
import path from "path";
import { log } from "../../../utils";
import proxyHandler from "./proxy-handler";

// var request = require('request');
// fetch("https://api.github.com/users/pavlovcik", );
export default async function test() {
  // const raw = await fetchSpysOne();

  // const ips = parseIpAddressesWithPortNumber(raw);
  const ips = goodList();
  const to = "https://api.github.com/users/pavlovcik";
  for (const proxy of ips as string[]) {
    // console.log({ proxy });
    setInterval(() => {
      const ip = ips.shift() as string;
      makeRequest(to, ip);
    }, 2500);
    break;
  }
}

test();

function goodList() {
  return [
    "http://190.92.35.102:999",
    "http://37.236.59.107:8080",
    "http://149.255.26.228:9090",
    "http://87.97.83.57:8080",
    "https://165.154.233.164:8080",
    "https://92.114.18.11:80",
    "http://160.20.152.80:443",
    "http://12.36.95.132:8080",
    "http://165.154.244.94:80",
    "http://81.200.123.74:80",
    "http://47.243.189.250:8000",
  ];
}
function makeRequest(to: string, proxy: string) {
  // var http = require("http");
  const parsed = new URL(proxy);
  const pathTo = path.join(process.cwd(), `test`, `successes.json`);
  console.log({ pathTo });
  proxyHandler(path);

  // console.log(parsed);
  // const options = {
  //   to,
  //   host: parsed.hostname,
  //   port: parsed.port,
  //   path: to,
  //   headers: {
  //     Host: to,
  //     "User-Agent": "My test app",
  //   },
  // };

  // const options = {
  //   to,
  //   host: parsed.hostname,
  //   port: parsed.port,
  //   // path: to,
  //   headers: {
  //     accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
  //     "accept-language": "en-US,en;q=0.5",
  //     "cache-control": "no-cache",
  //     pragma: "no-cache",
  //     "sec-fetch-dest": "document",
  //     "sec-fetch-mode": "navigate",
  //     "sec-fetch-site": "none",
  //     "sec-fetch-user": "?1",
  //     "sec-gpc": "1",
  //     "upgrade-insecure-requests": "1",
  //     cookie:
  //       "_octo=GH1.1.546211211.1654850925; dotcom_user=pavlovcik; logged_in=yes; color_mode=%7B%22color_mode%22%3A%22auto%22%2C%22light_theme%22%3A%7B%22name%22%3A%22light%22%2C%22color_mode%22%3A%22light%22%7D%2C%22dark_theme%22%3A%7B%22name%22%3A%22dark%22%2C%22color_mode%22%3A%22dark%22%7D%7D; tz=Asia%2FTaipei; preferred_color_mode=dark",
  //   },
  //   referrerPolicy: "strict-origin-when-cross-origin",
  //   body: null,
  //   method: "GET",
  // };

  // http
  //   .get(options, (resp) => {
  //     let data = "";

  //     // A chunk of data has been received.
  //     resp.on("data", (chunk) => {
  //       data += chunk;
  //     });

  //     // The whole response has been received. Print out the result.
  //     resp.on("end", () => {
  //       log.ok(data);
  //     });
  //   })
  //   .on("error", (err) => {
  //     log.error("Error: " + err.message);
  //   });

  // http.get(options, function (response) {
  // response.on("end", (value) => console.log(value.toString()));
  // response.on("close", (value) => console.log(value.toString()));
  // response.on("error", (value) => console.log(value.toString()));
  // response.on("data", (value) => console.log(value.toString()));
  // console.log(response);
  // response.pipe(process.stdout);
  // });
  // request(
  //   {
  //     url: "https://api.github.com/users/pavlovcik",
  //     // method: "GET",
  //     proxy,
  //     // proxy: `http://`.concat(proxy),
  //   },
  //   function (error, response, body) {
  //     if (!error && response.statusCode == 200) {
  //       console.log(body);
  //     } else {
  //       console.log("...");
  //     }
  //   }
  // );
}
