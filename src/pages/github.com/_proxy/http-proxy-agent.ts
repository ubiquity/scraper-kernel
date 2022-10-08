import url from "url";
import https from "https";
import HttpProxyAgent from "http-proxy-agent";
import { IncomingMessage } from "http";

export default function httpProxyAgent(proxy: string, endpoint: string) {
  console.log(">>", proxy, ">>");
  const endpointParsed = new URL(endpoint);

  const go = {
    hostname: endpointParsed.hostname,
    port: endpointParsed.port,
    path: endpointParsed.pathname,
    method: "GET",
    agent: HttpProxyAgent(proxy),
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    headers: {
      accept: "application/json;q=0.8",
      "accept-language": "en-US,en;q=0.5",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-fetch-dest": "document",
      "sec-fetch-mode": "navigate",
      "sec-fetch-site": "none",
      "sec-fetch-user": "?1",
      "sec-gpc": "1",
      "upgrade-insecure-requests": "1",
    },
  };

  https.request(go, function (response: IncomingMessage) {
    let body = "";
    response.on("readable", function () {
      body += response.read();
    });
    response.on("end", function () {
      console.log(body);
    });
    // console.log('"response" event!', response.statusMessage);
    // response.pipe(process.stdout);
  });
}

// fetch("https://api.github.com/users/pavlovcik", );
