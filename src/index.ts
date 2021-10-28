const homePage = process.argv[2];
import scrape from "./scrape";
// CLI ADAPTER
scrape(homePage)
  .then((data) => process.stdout.write(data))
  .catch((err) => process.stderr.write(err));
