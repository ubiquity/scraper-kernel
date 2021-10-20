import ProxyHandler from "./proxy-handler";
import { spysOneIps } from "./sources/spys-one";
// TODO turn into a class

const proxiesDisabled = process.env.DEBUG_DISABLE_PROXIES;

export default async function proxies() {
  if (proxiesDisabled) {
    console.trace("Proxies disabled");
    const handler = new ProxyHandler();
    return handler;
  }

  const ips = await spysOneIps();
  const handler = new ProxyHandler();
  handler.storage.flattened = ips as string[];
  return handler;
}
