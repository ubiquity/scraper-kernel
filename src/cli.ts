import "source-map-support/register";
import readCommandLineArgs from "./cli-args";
import scrape from "./scrape";

// CLI ADAPTER
scrape(readCommandLineArgs.urls, undefined, readCommandLineArgs.pages)
  .then((data) => {
    console.log(`<<`, data);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    // throw err;
    process.exit(1);
  });

//   // this is a hack for when pageTimeouts crash the scraper
// process.on("unhandledRejection", (error: Error, promise: Promise<unknown>) => {
//   console.error("Unhandled Rejection at: Promise", promise, "reason:", error);
//   // Stack Trace
//   console.error(error.stack);
// });
