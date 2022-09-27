import fs from "fs";
import path from "path";
import { PageLogic } from "../event-handlers";
import { initalizeStrategies } from "./loadPageLogic";
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
  console.log(colorizeText(`\t⚠ strategy index: ${index}`, "fgWhite"));

  if (!importing.includes(cwd)) {
    console.error(colorizeText(`\t⚠ THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID`, "fgRed"));
    // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
    return async (_browser: Browser) => {
      throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
    };
  }

  let logic: PageLogic | undefined;

  // IMPORT DEFAULT IF REQUESTED MODULE HAS BEEN FOUND
  if (fs.existsSync(importing)) {
    console.log(colorizeText(`\t⚠ file found looking for [default] in ${importing}`, "fgWhite"));
    const module = await import(importing);
    logic = module.default;
    if (logic) {
      // MODULE HAS BEEN LOADED SUCCESSFULLY, RESET STRATEGIES AND RETURN IT
      console.log(colorizeText(`\t⚠ module loaded successfully`, "fgGreen"));
      // strategies = resetStrategies();
      index = 0;
      console.log(logic);
      return logic;
    }
  }

  // LOGIC HAS NOT BEEN LOADED, TRY THE NEXT STRATEGY AND TRY AGAIN

  const strategy = strategies[index++];

  // WE FOUND A NEW STRATEGY
  if (strategy) {
    // console.log(colorizeText(`\t⚠ strategy found`, "fgGreen"));
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
