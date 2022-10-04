import "source-map-support/register";

// const userInput = process.argv.slice(2);
import commandLineArgs from "command-line-args";
import fs from "fs";
import scrape from "./scrape";
const options = commandLineArgs([
  { name: "urls", type: String, multiple: true, defaultOption: true, alias: "u" },
  // { name: "concurrency", type: Number, alias: "c" },
  { name: "verbose", type: Number, alias: "v" },
]);
export const VERBOSE = options.verbose;

if (VERBOSE) {
  // log unhandledRejections
  process.on("unhandledRejection", (error: Error, promise: Promise<unknown>) => {
    console.error("Unhandled Rejection at: Promise", promise, "reason:", error);
    // Stack Trace
    console.error(error.stack);
  });
}

// CLI ADAPTER
scrape(
  options.urls,
  undefined
  // , options.concurrency
).then((data) => {
  console.log(`<<`, data);
  // fs.writeFileSync("results.json", JSON.stringify(data)); // temporary
  process.exit(0);
});
// .catch((err) => {
// console.error(err);
// throw err;
// process.exit(1);
// });
