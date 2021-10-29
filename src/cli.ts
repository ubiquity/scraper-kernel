const homePage = process.argv[2];
import scrape from "./scrape";
// CLI ADAPTER
scrape(homePage)
  .then((data) => console.log(data))
  .catch((err) => console.error(err));
