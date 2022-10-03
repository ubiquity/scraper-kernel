// const userInput = process.argv.slice(2);
import commandLineArgs from "command-line-args";
import fs from "fs";
import scrape from "./scrape";
const options = commandLineArgs([
  { name: "urls", type: String, multiple: true, defaultOption: true, alias: "u" },
  { name: "concurrency", type: Number, alias: "c" },
]);
// CLI ADAPTER
scrape(options.urls, undefined, options.concurrency)
  .then((data) => {
    console.log(`<<`, data);
    fs.writeFileSync("results.json", JSON.stringify(data)); // temporary
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
