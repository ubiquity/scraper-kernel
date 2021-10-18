// It will name the function whatever you want, dynamically and the function name can be seen in the stack trace

import ScrapedProject from "../../../../@types/scraped-project";
import { Job } from "./index";

export function dynamicallyNameFunction(name: string, functionToDynamicallyName: Job) {
  return {
    [name]: functionToDynamicallyName(),
  }[name];
}
