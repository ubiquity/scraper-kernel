import writeCsvToDisk from "./json2csv";
import path from "path";
import readDatabase from ".";

readDatabase("GitHub User").then((data) => {
  if (data.length) {
    const headers = Object.keys(data[0]);
    const date = Date.now();
    const filename = path.resolve(process.cwd(), `database-export-${date}.csv`);

    writeCsvToDisk(headers, data, filename);
    return data;
  }
});
