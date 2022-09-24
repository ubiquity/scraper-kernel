import { PageLogic } from "../event-handlers";
import { failSafe } from "./failSafe";
import { recurseDirUp } from "./recurseDirUp";

type DestinationStrategy = (destination: string) => string;

interface Params {
  destination: string;
  strategies: DestinationStrategy[];
  fallback: typeof recurseDirUp;
}

export async function recurseAttemptImport({ destination, strategies, fallback }: Params): Promise<Promise<PageLogic>> {
  const logic = await failSafe(async () => (await import(destination)).default);

  if (logic) {
    return logic;
  } else {
    const changeDestinationStrategy = strategies.shift();
    if (changeDestinationStrategy) {
      destination = changeDestinationStrategy(destination);
      return await recurseAttemptImport({ destination, strategies, fallback });
    } else {
      return await fallback(destination);
    }
  }
}
