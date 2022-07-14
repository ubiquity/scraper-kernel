// const cliParam = process.argv[2];
import scrape from "./scrape";

// CLI ADAPTER
export default async function cli(url: string) {
  let results;
  try {
    results = await scrape(url);
    console.log(results);
  } catch (error) {
    console.error(error);
  }
  return results;
}

const promises = [] as any[];
for (const url of process.argv.slice(2)) {
  promises.push(cli(url));
}

// interface Result {
//   status: "fulfilled";
//   value: number;
// }
Promise.allSettled(promises).then((...args) => {
  console.trace(...args);
  process.exit(0);
});
