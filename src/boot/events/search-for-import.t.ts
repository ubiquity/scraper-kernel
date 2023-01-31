import { searchForImport } from "./search-for-import";

// test
const paths = [
  "/Users/nv/repos/ubiquity/scraper/dist/pages/github.com/orgs/surfDB/repositories",
  // "/Users/nv/repos/ubiquity/scraper/dist/pages/github.com/ubiquity/",
  // "/Users/nv/repos/ubiquity/scraper/dist/pages/github.com/pavlovcik",
  // "/Users/nv/repos/ubiquity/scraper/dist/pages/github.com/ubiquity/ubiquity-dollar",
  // "/Users/nv/repos/ubiquity/scraper/dist/pages/github.com/ubiquity/ubiquity-dollar/",
];

/**

describe the pattern:

1. index
2. wildcard.
3. if nothing found in current directory, save current position, then replace parent directory with *
4. check if out of bounds
  a. if out of bounds, restart loop from saved position, checking its parent directory for index.js
  b. if not out of bounds, replace parent directory with *

      \dist\pages\github.com\pavlovcik\test-repo\index.js
      \dist\pages\github.com\pavlovcik\test-repo\*
      \dist\pages\github.com\pavlovcik\*\*
      \dist\pages\github.com\*\*\*
      \dist\pages\*\*\*\*
      \dist\*\*\*\*\*
      \*\*\*\*\*\*
      \dist\pages\github.com\pavlovcik\index.js
      \dist\pages\github.com\pavlovcik\*
      \dist\pages\github.com\*\*
      \dist\pages\*\*\*
      \dist\*\*\*\*
      \*\*\*\*\*
      \dist\pages\github.com\index.js
      \dist\pages\github.com\*
      \dist\pages\*\*
      \dist\*\*\*
      \*\*\*\*
      \dist\pages\index.js
      \dist\pages\*
      \dist\*\*
      \*\*\*
      \dist\index.js
      \dist\*
      \*\*
      \index.js
      \*

 */

async function test(paths) {
  for (const path of paths) {
    console.log(`>> ${path}`);
    await searchForImport(path, 5);
    console.log();
    // log.warn(`${renameLastPartOfPathToWildCard(path)}`);
    // console.log();
  }
}

test(paths);
