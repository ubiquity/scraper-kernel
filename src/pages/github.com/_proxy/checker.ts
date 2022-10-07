import { check } from "check-proxy";

export default async function ProxyChecker(proxyIP: string, proxyPort: number) /*: Promise<TestResult> */ {
  return await check({
    testHost: "api.github.com", // put your ping server url here
    proxyIP, // proxy ip to test
    proxyPort, // proxy port to test
    localIP: "127.0.0.1", // local machine IP address to test
    connectTimeout: 6, // curl connect timeout, sec
    timeout: 10, // curl timeout, sec
    websites: [
      {
        name: "one",
        url: "http://www.example.com/",
        regex: /example/gim, // expected result - regex
      },
      {
        name: "two",
        url: "http://www.yandex.ru/",
        regex: /yandex/gim, // expected result - regex
      },
      // {
      //   name: "three",
      //   url: "http://www.google.com/",
      //   regex: function (html: string | string[]) {
      //     // expected result - custom function
      //     return html && html.indexOf("google") != -1;
      //   },
      // },
      {
        name: "amazon",
        url: "http://www.amazon.com/",
        regex: "Amazon", // expected result - look for this string in the output
      },
    ],
  });
  // .then(
  //   function (res) {
  //     console.log("final result", res);
  //   },
  //   function (err) {
  //     console.log("proxy rejected", err);
  //   }
  // );
}

type TestResult = [
  {
    get: true;
    post: true;
    cookies: true;
    referer: true;
    "user-agent": true;
    anonymityLevel: 1;
    supportsHttps: true;
    protocol: "http";
    ip: "107.151.152.218";
    port: 80;
    country: "MX";
    connectTime: 0.23; // Time in seconds it took to establish the connection
    totalTime: 1.1; // Total transaction time in seconds for last the transfer
    websites: {
      example: {
        responseCode: 200;
        connectTime: 0.648131; // seconds
        totalTime: 0.890804; // seconds
        receivedLength: 1270; // bytes
        averageSpeed: 1425; // bytes per second
      };
      google: {
        responseCode: 200;
        connectTime: 0.648131; // seconds
        totalTime: 0.890804; // seconds
        receivedLength: 1270; // bytes
        averageSpeed: 1425; // bytes per second
      };
      amazon: false;
      yandex: false;
    };
  }
];
