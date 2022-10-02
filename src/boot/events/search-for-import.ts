import fs from "fs";
import path from "path";
import { log } from "../../utils";
import { PageLogic } from "../event-handlers";

export type DestinationStrategy = (destination: string) => string;

const cwd = process.cwd();

// @TODO: loading logic should recurse up directory parents and replace them with asterisks
// e.g. github.com/*/* should be considered for repos

let failsafe = 10;

export async function searchForImport(importing: string, savedPosition?: string): Promise<PageLogic> {
  if (!--failsafe) {
    throw new Error("infinite loop?");
  }
  // console.log(colorizeText(`recursion!`, "fgWhite"));
  if (!importing.includes(cwd)) {
    log.error(`out of bounds`);
    if (!savedPosition) {
      // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
      throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
    } else {
      importing = path.resolve(savedPosition, ".."); // go up one
      log.warn(importing);
    }
  }

  const logic = (await checkModifier(importing, "index.js")) || (await checkModifier(importing, "*"));

  if (logic) {
    return logic;
  } else {
    const startPosition = importing;
    const wildCardPath = renameLastPartOfPathToWildCard(importing); // pathname ends with */*
    return await searchForImport(wildCardPath, startPosition);
  }
}

function renameLastPartOfPathToWildCard(query: string) {
  const pathParts = query.split(path.sep); // for windows "\" and unix "/" like separators
  let x = pathParts.length;
  while (x--) {
    // fast reverse loop
    const part = pathParts[x];
    if (part !== "*") {
      // rename latest path part
      pathParts[x] = "*";
      break;
    }
  }
  let resolved = path.resolve(...pathParts);
  resolved = resolved.replace(process.cwd(), "");

  // console.warn(pathParts);
  // log.warn(pathParts.join(path.sep));
  // log.ok(resolved);
  return resolved;
}

async function checkModifier(importing: string, modifier: string) {
  let logic;
  const importingDestination = path.resolve(importing, modifier);
  // console.log(colorizeText(`\t⚠ trying ${importingDestination}`, "fgWhite"));
  // console.trace(importingDestination);
  if (fs.existsSync(importingDestination)) {
    // console.log(colorizeText(`\t⚠ [${importingDestination}] found looking for [default]`, "fgWhite"));
    logic = (await import(importingDestination))?.default;
    if (logic) {
      log.ok(`[${importingDestination.slice(process.cwd().length)}] module loaded successfully`);
      return logic as PageLogic;
    }
  } else {
    log.info(`[${importingDestination.slice(process.cwd().length)}] not found`);
    return null;
  }
}
