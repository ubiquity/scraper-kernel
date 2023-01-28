import path from "path";
import { resolveProjectPath } from "../../../boot/events/search-for-import";
import commandLineArgs from "../../../cli-args";
import { log } from "../../../utils";
import grab from "./fetch-from-supabase";
import writeCsvToDisk from "./json2csv";

// let tableName; // = "GitHub User"; // default

// if (commandLineArgs.table?.length) {
log.info(`writing to database table ${commandLineArgs.table}`);
const tableName = commandLineArgs.table as string;
// }

async function _wrapper() {
  const data = await grab(tableName, "*");
  // console.log(data);
  if (data.length) {
    const headers = Object.keys(data[0]);
    const date = Date.now();
    const filename = path.resolve(resolveProjectPath(), `database-export-${date}.csv`);

    writeCsvToDisk(headers, data, filename);
  }
}

_wrapper();
