import fs from "fs";
import path from "path";
import { PageLogic } from "../event-handlers";
import { resetStrategies } from "./loadPageLogic";
import { Browser } from "puppeteer";

export type DestinationStrategy = (destination: string) => string;

interface Params {
  importing: string;
  strategies: DestinationStrategy[];
}

const cwd = process.cwd();
console.log(cwd);

export async function searchForImport({ importing, strategies }: Params): Promise<Promise<PageLogic>> {
  // console.log({ importing, cwd });
  if (!importing.includes(cwd)) {
    // THE REQUESTED IMPORT PATH IS OUTSIDE OF THE PROJECT DIRECTORY, WHICH IS INVALID
    return async (_browser: Browser) => {
      throw new Error("the requested page logic import path is outside of the project directory, which is invalid");
    };
  }

  let logic: PageLogic | undefined;

  // IMPORT DEFAULT IF REQUESTED MODULE HAS BEEN FOUND
  if (fs.existsSync(importing)) {
    const module = await import(importing);
    logic = module.default;
  }

  // MODULE HAS BEEN LOADED SUCCESSFULLY, RESET STRATEGIES AND RETURN IT
  if (logic) {
    resetStrategies();
    return logic;
  } else {
    // LOGIC HAS NOT BEEN LOADED, TRY THE NEXT STRATEGY AND TRY AGAIN
    const strategy = strategies.shift();
    // WE FOUND A NEW STRATEGY
    if (strategy) {
      importing = strategy(importing);
      return await searchForImport({
        importing,
        strategies,
      });
      // WE DO NOT HAVE ANY MORE STRATEGIES, SO GO UP TO PARENT DIRECTORY, RESET STRATEGIES, AND TRY AGAIN
    } else {
      importing = path.resolve(importing, ".."); // go up one
      resetStrategies();

      // else {
      return await searchForImport({
        importing,
        strategies,
      });
      // }
    }
  }
}
