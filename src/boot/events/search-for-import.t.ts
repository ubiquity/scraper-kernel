import { log } from "../../logging";
import { searchForImport } from "./search-for-import-2";

// test
const paths = ["/Users/nv/repos/pavlovcik/scraper-parent-test/src/pages/github.com/hyperlane-xyz/fuel-contracts/pull/90"];

/**

describe the pattern:

1. index
2. wildcard.
3. if nothing found in current directory, save current position, then replace parent directory with *
4. check if out of bounds
  a. if out of bounds, restart loop from saved position, checking its parent directory for index.js
  b. if not out of bounds, replace parent directory with *

      \dist\pages\github.com\pavlovcik\test-repo\index.ts
      \dist\pages\github.com\pavlovcik\test-repo\*
      \dist\pages\github.com\pavlovcik\*\*
      \dist\pages\github.com\*\*\*
      \dist\pages\*\*\*\*
      \dist\*\*\*\*\*
      \*\*\*\*\*\*
      \dist\pages\github.com\pavlovcik\index.ts
      \dist\pages\github.com\pavlovcik\*
      \dist\pages\github.com\*\*
      \dist\pages\*\*\*
      \dist\*\*\*\*
      \*\*\*\*\*
      \dist\pages\github.com\index.ts
      \dist\pages\github.com\*
      \dist\pages\*\*
      \dist\*\*\*
      \*\*\*\*
      \dist\pages\index.ts
      \dist\pages\*
      \dist\*\*
      \*\*\*
      \dist\index.ts
      \dist\*
      \*\*
      \index.ts
      \*

 */

async function test(paths) {
  for (const path of paths) {
    log.info(`>> ${path}`);
    const handler = await searchForImport(path);
    log.ok(handler);
  }
}
test(paths);
