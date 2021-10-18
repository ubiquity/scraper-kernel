import ProxyHandler from "./proxy-handler";
import { spysOneIps } from "./sources/spys-one";
// TODO turn into a class
export default async function proxies() {
  const ips = await spysOneIps();
  const handler = new ProxyHandler();
  handler.storage.flattened = ips as string[];
  return handler;
}
