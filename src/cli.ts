const homePage = process.argv[2];
import scrape from "./scrape";
// CLI ADAPTER
scrape(homePage)
  .then((data) => {
    console.log(data);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
