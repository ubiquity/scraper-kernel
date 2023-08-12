import fs from "fs";
import path from "path";
import { PageLogic } from "../event-handlers";
import { log } from "../../logging";

import { PAGES_PATH } from "../../PAGES_PATH";

export type DestinationStrategy = (destination: string) => string;

export function resolvePagesPath() {
  const projectPath = PAGES_PATH;
  if (!projectPath) {
    throw new Error("no project path resolved");
  }
  return projectPath;
}

const pagesPath = resolvePagesPath();

export async function searchForImport(importing: string, startPosition?: string): Promise<PageLogic> {
  return await _searchForImport(importing, startPosition ? startPosition : importing);
}

async function _searchForImport(importing: string, startPosition: string) {
  if (importing.endsWith(path.sep)) {
    // normalize requested path name to remove trailing slash
    importing = importing.slice(0, -1);
  }

  if (!importing.includes(pagesPath)) {
    log.error(`out of bounds`);
    importing = startPosition = path.resolve(startPosition, ".."); // go up one directory from `startPosition`
  }

  const logic = (await checkModifier(importing, "index.ts")) || (await checkModifier(importing, "*"));

  if (logic) {
    return logic;
  } else {
    const wildCardPath = renameLastPartOfPathToWildCard(importing); // pathname ends with */*
    return await _searchForImport(wildCardPath, startPosition);
  }
}

export function renameLastPartOfPathToWildCard(query: string) {
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
  const resolvedPath = pathParts.join(path.sep);
  if (!resolvedPath.includes(pagesPath)) {
    log.warn(`requested: ${resolvedPath}`);
    log.warn(`directory: ${pagesPath}`);
    throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
  }

  return resolvedPath;
}

async function checkModifier(importing: string, modifier: string) {
  const importingDestination = path.resolve(importing, modifier);
  if (fs.existsSync(importingDestination)) {
    const logic = (await import(importingDestination))?.default;
    if (logic) {
      log.ok(`"${importingDestination}" module loaded successfully`);
      return logic as PageLogic;
    }
  } else {
    log.info(`"${importingDestination}" not found`);
    return null;
  }
}
