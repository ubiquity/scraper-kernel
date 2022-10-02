import fs from "fs";
import path from "path";
import { log } from "../../utils";
import { PageLogic } from "../event-handlers";

export type DestinationStrategy = (destination: string) => string;

const cwd = process.cwd();
const safetyBuffer = path.basename(path.join(cwd, ".."));

// @TODO: loading logic should recurse up directory parents and replace them with asterisks
// e.g. github.com/*/* should be considered for repos

let failsafe = 30;

export async function searchForImport(importing: string, startPosition?: string): Promise<PageLogic> {
  return await _searchForImport(importing, startPosition ? startPosition : importing);
}

async function _searchForImport(importing: string, startPosition: string) {
  // if (!savedPosition) {
  //   // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
  //   throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
  // } else {
  if (!--failsafe) {
    throw new Error("infinite loop?");
  }
  // console.log(colorizeText(`recursion!`, "fgWhite"));
  if (!importing.includes(cwd)) {
    log.error(`out of bounds`);
    importing = startPosition = path.resolve(startPosition, ".."); // go up one
    // importing = path.resolve(startPosition);
  }

  // log.warn(`[${startPosition}] startPosition`);
  // log.warn(`[${importing}] up to parent`);
  // }
  const logic = (await checkModifier(importing, "index.js")) || (await checkModifier(importing, "*"));

  if (logic) {
    return logic;
  } else {
    // const startPosition = importing;
    const wildCardPath = renameLastPartOfPathToWildCard(importing); // pathname ends with */*
    // console.log(wildCardPath);
    return await _searchForImport(wildCardPath, startPosition);
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
  // let resolved = path.resolve(...pathParts);
  const resolved = pathParts.join(path.sep);

  // console.log(resolved, safetyBuffer);

  if (!resolved.includes(safetyBuffer)) {
    // console.log(pathParts); // check if only cwd remain. if so then we ran out of options and throw error
    //   // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
    throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
  }

  // resolved = resolved.replace(cwd, "");

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
