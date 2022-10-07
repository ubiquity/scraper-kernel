import "source-map-support/register";

import commandLineArgs from "command-line-args";
import fs from "fs";
import scrape from "./scrape";
import verboseMode from "./verbose";
const options = commandLineArgs([
  { name: "urls", type: String, multiple: true, defaultOption: true, alias: "u" },
  // { name: "concurrency", type: Number, alias: "c" },
  { name: "verbose", type: Number, alias: "v" },
]);
verboseMode(options.verbose);
// CLI ADAPTER
scrape(options.urls).then((data) => {
  console.log(`<<`, data);
  // fs.writeFileSync("results.json", JSON.stringify(data)); // temporary
  process.exit(0);
});
// .catch((err) => {
// console.error(err);
// throw err;
// process.exit(1);
// });
