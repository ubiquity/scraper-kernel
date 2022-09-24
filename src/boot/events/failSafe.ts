import { events } from "../../scrape";
import { PageLogicSignature } from "./browserOnTargetChanged";

export async function failSafe(logic: { (): Promise<PageLogicSignature | void> }) {
  try {
    return await logic();
  } catch (error) {
    events.emit("logicfailed", error);
  }
}
