import { ITestProtocolResult } from "check-proxy/build/lib/interfaces";
import checker from "./checker";

type ProxyList = string[];
process.on("unhandledRejection", (error: Error) => {
  // Will print "unhandledRejection err is not defined"
  console.log("unhandledRejection", error.message);
});
export default async function filterList(list: ProxyList) {
  // const list = await this.proxies.list;
  if (!list) return null;

  const tests = [] as (() => Promise<ITestProtocolResult[] | null>)[];

  for (const proxy of list) {
    tests.push(setupTest(proxy));
  }

  const results = [] as ITestProtocolResult[][];
  for (const test of tests) {
    if (!test) continue;

    const result = await test();
    console.log({ result });
    if (result) {
      results.push(result);
    }
  }

  return results;
}
function setupTest(proxy: string) {
  const url = new URL(proxy);
  const ip = url.hostname;
  const port = url.port;
  // console.log(`checking ${ip}:${port}`);
  return async () => {
    // try {
    const result = await checker(ip, Number(port));
    console.trace(result);
    // checked.push(result);
    return result;
    // } catch (error) {
    //   return null;
    // }
  };
}
