import dotenv from "dotenv";
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import newTabToURL from "./boot/new-tab-to-url";
import config from "./config";

dotenv.config();
const homePage = process.argv[2];

browserSetup(config) // Setup browser and listen for events
  .then((browser) => newTabToURL(browser, homePage)) // Open new tab and load page
  .catch((err) => console.error(err)); // Log error

// globalTargetChangedHandler(browser)
// .then
// ({ logic, page }) =>
//   runLogic({ logic, page }) //
//     .then(saveResultsToDisk) //
//     .catch((err) => {
//       console.error(err);
//       process.exit(1);
//     })
//     .finally(tearDown(browser));

// function saveResultsToDisk(results: any) {
//   fs.writeFileSync(path.join(process.cwd(), "dist", "results.json"), JSON.stringify(results));
//   console.trace(results);
// }
