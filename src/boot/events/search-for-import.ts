import fs from "fs";
import path from "path";
import { PageLogic } from "../event-handlers";
import { Browser } from "puppeteer";
import { colorizeText } from "../../utils";

export type DestinationStrategy = (destination: string) => string;

interface Params {
  importing: string;
  strategies: DestinationStrategy[];
  index: number;
}

const cwd = process.cwd();

export async function searchForImport({ importing, strategies, index }: Params): Promise<Promise<PageLogic>> {
  // console.log(colorizeText(`\t⚠ strategy index: ${index}`, "fgWhite"));

  if (!importing.includes(cwd)) {
    console.error(colorizeText(`\t⚠ THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID`, "fgRed"));
    // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
    return async (_browser: Browser) => {
      throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
    };
  }

  // let logic: PageLogic | undefined;

  // IMPORT DEFAULT IF REQUESTED MODULE HAS BEEN FOUND
  console.log(importing);

  const importingIndex = path.join(importing, "index");
  const importingWildcard = path.join(importing, "*");
  let module;
  let logic;
  if (fs.existsSync(importingIndex)) {
    console.log(colorizeText(`\t⚠ file found looking for [default] in ${importingIndex}`, "fgWhite"));
    module = await import(importingIndex); // where the problem is
    logic = module.default;
  }
  if (fs.existsSync(importingWildcard)) {
    console.log(colorizeText(`\t⚠ file found looking for [default] in ${importingWildcard}`, "fgWhite"));
    module = await import(importingWildcard); // where the problem is
    logic = module.default;
  }

  // if (fs.existsSync(importingIndex) || fs.existsSync(importingWildcard)) {
  // @FIXME: needs to do fs.fileExistsSync because I have an edge case where I have an empty directory
  // importing can be a path to an empty directory and still pass
  // console.log(colorizeText(`\t⚠ file found looking for [default] in ${importing}`, "fgWhite"));
  // const module = await import(importing); // where the problem is
  // logic = module.default;
  if (logic) {
    // MODULE HAS BEEN LOADED SUCCESSFULLY, RESET STRATEGIES AND RETURN IT
    console.log(colorizeText(`\t⚠ module loaded successfully`, "fgGreen"));
    // strategies = resetStrategies();
    index = 0;
    console.log(logic);
    return logic;
  }
  // }

  // LOGIC HAS NOT BEEN LOADED, TRY THE NEXT STRATEGY AND TRY AGAIN

  const strategy = strategies[index++];

  // WE FOUND A NEW STRATEGY
  if (strategy) {
    importing = strategy(importing);
    return await searchForImport({
      importing,
      strategies,
      index,
    });
  }
  // console.error(colorizeText(`\t⚠ strategy not found`, "fgRed"));
  // else {
  // WE DO NOT HAVE ANY MORE STRATEGIES, SO GO UP TO PARENT DIRECTORY, RESET STRATEGIES, AND TRY AGAIN
  importing = path.resolve(importing, ".."); // go up one
  // strategies = resetStrategies();
  index = 0;
  return await searchForImport({
    importing,
    strategies,
    index,
  });
  // }
}
