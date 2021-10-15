import ProxyHandler from "./proxy-handler";
import spysOne from "./sources/spys-one";
export default async function proxies() {
  const ips = await spysOne();
  const handler = new ProxyHandler();
  handler.storage.flattened = ips as string[];
  return handler;
}
