import commandLineArgs from "command-line-args";

export function readCommandLineArgs() {
  const options = commandLineArgs([
    { name: "verbose", type: Number, alias: "v" },
    { name: "headful", type: Boolean, alias: "h" },
    { name: "cosmetics", type: Boolean, alias: "c" }, // default behavior only load essential resources. `-c` will load all resources (stylesheets etc)
    { name: "urls", type: String, alias: "u", multiple: true, defaultOption: true },
    // { name: "concurrency", type: Number, alias: "c" },
  ]);
  return options;
}
const args = readCommandLineArgs();

if (args?.verbose) {
  console.log(args);
}

export default args;
