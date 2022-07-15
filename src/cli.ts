const userInput = process.argv.slice(2);
import main from "./scrape";
function sanitizeUserInput(input: string[]) {
  const sanitized = input.map((url: string) => {
    if (!url.includes("//")) {
      // probably doesn't include the https:// protocol
      return new URL(`https://`.concat(url)).href;
    } else {
      return new URL(url).href;
    }
  });
  // console.log(sanitized);
  return sanitized;
}

const sanitizedInput = sanitizeUserInput(userInput);
// CLI ADAPTER
main(sanitizedInput)
  .then((data) => {
    console.log(`<<`, data);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
