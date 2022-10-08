import "source-map-support/register";
import ProxyVerifier from "proxy-verifier";
import { log } from "../../../utils";
import { getSpysOneProxies, parseIpAddressesWithPortNumber, prefixWithHttpsOrHttp } from "./proxy";

process.on("uncaughtException", (error) => console.error(error));

export default async function test() {
  const raw = await getSpysOneProxies();
  const prefixedList = prefixWithHttpsOrHttp(raw as string[]);

  const httpsList = prefixedList.filter((item) => {
    // console.log({ item });
    const https = item.startsWith("https://");
    if (https) return true;
  });

  const httpsProxiesWithPortNumber = httpsList.map((row) => parseIpAddressesWithPortNumber(row)?.shift());
  console.log({ httpsProxiesWithPortNumber });

  const processes = [] as unknown[];
  for (const proxyIpAddress of httpsProxiesWithPortNumber) {
    const _process = processor(proxyIpAddress);
    processes.push(_process);
  }
  console.log(await Promise.any(processes));
}

test();

function processor(proxyIpAddress?, b?, c?, d?) {
  const getProto = (parsed: URL) => {
    if (parsed.href.includes("https")) {
      return parsed.protocol.slice(0, -1) as "https";
    } else {
      return "https";
    }
  };
  return new Promise((resolve, reject) => {
    if (!proxyIpAddress.includes("https")) {
      proxyIpAddress = "https://".concat(proxyIpAddress);
    }

    const parsed = new URL(proxyIpAddress);
    const proto = getProto(parsed);
    // console.log(proto);
    const protocol = "http";
    const verifyMe = {
      ipAddress: parsed.hostname,
      port: Number(parsed.port),
      protocol, // proto,
    };

    const callback = (message: string) =>
      function _callback(error, result) {
        if (error) {
          return reject(error);
        } else {
          const _error = result.protocols[protocol]?.error?.message;
          if (_error) {
            log.error(_error);
            return reject(result);
          } else if (result?.tunnel?.ok) {
            return resolve(message);
          }
        }
      };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore-error
    ProxyVerifier.testAll(verifyMe, callback(proxyIpAddress));
  });
}

function goodList() {
  return [
    "37.236.59.107:8080",
    "165.154.233.164:8080",
    "92.114.18.11:80",
    "165.154.244.94:80",
    "81.200.123.74:80",
    // "http://190.92.35.102:999",
    // "http://37.236.59.107:8080",
    // "http://149.255.26.228:9090",
    // "http://87.97.83.57:8080",
    // "https://165.154.233.164:8080",
    // "https://92.114.18.11:80",
    // "http://160.20.152.80:443",
    // "http://12.36.95.132:8080",
    // "http://165.154.244.94:80",
    // "http://81.200.123.74:80",
    // "http://47.243.189.250:8000",
  ];
}
