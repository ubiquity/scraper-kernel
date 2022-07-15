const userInput = process.argv.slice(2);
import entryPoint from "./scrape";
// CLI ADAPTER
entryPoint(userInput)
  .then((data) => {
    console.log(`<<`, data);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
