import commandLineArgs from "command-line-args";
import { log } from "./utils";

export function readCommandLineArgs() {
  const options = commandLineArgs([
    { name: "verbose", type: Number, alias: "v" },
    { name: "headful", type: Boolean, alias: "h" },
    { name: "urls", type: String, alias: "u", multiple: true, defaultOption: true },
    // { name: "concurrency", type: Number, alias: "c" },
  ]);
  return options;
}
const args = readCommandLineArgs();
console.log(args);
log.ok(JSON.stringify(args, null, "\t"));
export default args;
