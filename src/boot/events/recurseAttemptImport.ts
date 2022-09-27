import fs from "fs";
import { PageLogic } from "../event-handlers";
import { recurseDirUp } from "./recurseDirUp";

type DestinationStrategy = (destination: string) => string;

interface Params {
  importing: string;
  strategies: DestinationStrategy[];
  fallback: typeof recurseDirUp;
}

export async function recurseAttemptImport({ importing, strategies, fallback }: Params): Promise<Promise<PageLogic>> {
  let logic: PageLogic | undefined;

  if (fs.existsSync(importing)) {
    const module = await import(importing);
    logic = module.default;
  }
  // else {
  // events.emit("logicfailed", error);
  // }

  if (logic) {
    return logic;
  } else {
    const changeDestinationStrategy = strategies.shift();
    if (changeDestinationStrategy) {
      importing = changeDestinationStrategy(importing);
      return await recurseAttemptImport({ importing, strategies, fallback });
    } else {
      return await fallback(importing);
    }
  }
}
