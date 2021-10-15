import { ProxyHandlerDataStore } from "./proxy-handler-data-store";
export default class ProxyHandler {
  storage: ProxyHandlerDataStore;
  constructor(input?: any) {
    this.storage = new ProxyHandlerDataStore(input);
  }
}
