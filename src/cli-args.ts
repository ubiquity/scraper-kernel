import commandLineArgs from "command-line-args";

export function readCommandLineArgs() {
  const options = commandLineArgs([
    { name: "verbose", type: Number, alias: "v" },
    { name: "headful", type: Boolean, alias: "h" },
    { name: "urls", type: String, alias: "u", multiple: true, defaultOption: true },
    // { name: "concurrency", type: Number, alias: "c" },
  ]);
  return options;
}
export default readCommandLineArgs();
