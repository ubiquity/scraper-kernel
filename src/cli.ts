const userInput = process.argv.slice(2);
import entryPoint from "./scrape";
import fs from "fs";
// CLI ADAPTER
entryPoint(userInput)
  .then((data) => {
    console.log(`<<`, data);
    fs.writeFileSync("results.json", JSON.stringify(data));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
