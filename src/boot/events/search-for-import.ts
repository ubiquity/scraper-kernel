import fs from "fs";
import path from "path";
import { PageLogic } from "../event-handlers";
import { colorizeText } from "../../utils";

export type DestinationStrategy = (destination: string) => string;

const cwd = process.cwd();

export async function searchForImport(importing: string): Promise<PageLogic> {
  console.log(colorizeText(`recursion!`, "fgWhite"));
  if (!importing.includes(cwd)) {
    console.error(colorizeText(`\t⚠ out of bounds`, "fgRed"));
    // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
    throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
  }

  const logic = (await checkModifier(importing, "index")) || (await checkModifier(importing, "*"));

  if (logic) {
    return logic;
  } else {
    // const directory = path.filename(importing); // normalize
    importing = path.join(importing, ".."); // go up one
    return await searchForImport(importing);
  }
}

async function checkModifier(importing: string, modifier: string) {
  let logic;
  const importingDestination = path.join(importing, modifier);
  console.log(colorizeText(`\t⚠ importing ${importingDestination}`, "fgWhite"));
  // console.trace(importingDestination);
  if (fs.existsSync(importingDestination)) {
    // console.log(colorizeText(`\t⚠ file found looking for [default] in ${importingDestination}`, "fgWhite"));
    logic = (await import(importingDestination))?.default;
    if (logic) {
      console.log(colorizeText(`\t⚠ module loaded successfully ${importingDestination}`, "fgGreen"));
      return logic as PageLogic;
    }
  } else {
    return null;
  }
}
