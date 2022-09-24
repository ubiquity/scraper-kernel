import { events } from "../../scrape";
import { PageLogic } from "../event-handlers";

export async function failSafe(logic: { (): Promise<Promise<PageLogic> | void> }) {
  try {
    return await logic();
  } catch (error) {
    events.emit("logicfailed", error);
  }
}
