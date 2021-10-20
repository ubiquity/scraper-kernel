import dotenv from "dotenv";
dotenv.config();
import "source-map-support/register";
import browserSetup from "./boot/browser-setup";
import newTabToURL from "./boot/new-tab-to-url";
import config from "./config";
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
