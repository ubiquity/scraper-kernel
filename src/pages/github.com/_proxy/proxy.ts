export async function proxies() {
  if (process.env.DEBUG_DISABLE_PROXIES) {
    console.trace("Proxies disabled");
    return [];
  }

  const proxies = await getSpysOneProxies();
  return proxies;
}

export async function getSpysOneProxies() {
  const response = await fetchSpysOne();
  const rows = parseIpAddressesRow(response);
  if (!rows) {
    throw new Error("no rows");
  }
  return prefixWithHttpsOrHttp(rows);
}

// export function _filterForHttps(rows: RegExpMatchArray) {
//   const proxiesRaw = rows.map((row) => {
//     const ip = parseIpAddressesWithPortNumber(row)?.shift();
//     if (ip) {
//       const https = row.includes("-S ");
//       return https ? "https://".concat(ip) : "http://".concat(ip); // https or http;
//     } else {
//       return null;
//     }
//   });
//   // return proxiesRaw;
//   return proxiesRaw.filter(Boolean) as string[];
// }
export function prefixWithHttpsOrHttp(rows: RegExpMatchArray) {
  const list = rows.map((row) => {
    const ip = parseIpAddressesRow(row)?.shift();
    if (ip) {
      const https = row.includes("-S ");
      const value = https ? "https://".concat(ip) : "http://".concat(ip); // https or http;
      // if (https) {
      // console.log(value);
      // }
      return value;
    } else {
      return null;
    }
  });

  const filtered = list.filter(Boolean) as string[];
  // console.log({ filtered });
  // return proxiesRaw;
  return filtered;
}

function parseIpAddressesRow(response: string) {
  const ipRowRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}.+/g; // "20.25.84.98:9090 US-N - "
  return response.match(ipRowRegex);
}

export function parseIpAddressesWithPortNumber(response: string) {
  const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}:\d{1,5}/g;
  return response.match(ipRegex);
}

export async function fetchSpysOne() {
  const URL = "https://spys.me/proxy.txt";
  const body = await (await fetch(URL)).text();
  return body;
}
