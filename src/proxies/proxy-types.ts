// type ProxySingle[] = Array<ProxySingle>; //	successes.json
export type ProxyLocation = string | ProxySingle[];

// export interface ProxyHandlerInputs {
//   [key: string]: any;
//   location?: string | ProxySingle[];
//   persist?: boolean;
// }

export interface ProxyPerformance {
  //	successes.json[performance][x]
  tested: string; // "Sun Apr 14 2019 15:38:18 GMT-0500 (Central Daylight Time)",
  ping: number;
}

export interface ProxySingle {
  //	successes.json[x]
  // id: any; // IParsedURL;
  // details: any;
  ip: string;
  origin?: string;
  performance?: ProxyPerformance;
}

// export class Proxies extends Array {
//   static
// }
