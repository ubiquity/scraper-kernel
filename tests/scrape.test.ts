import { JobResult, UserSettings } from "../src/scrape";
import scrape from "../src/scrape";
import { setupConfig } from "../src/boot/config";

describe("scrape", () => {
  const settings: UserSettings = {
    urls: ["https://dao.ubq.fi"],
    pages: "/about",
  };

  it("should display local config", () => {
    const args = { chromium: ["--lang=en-US,en;q=0.9"] };
    const config = setupConfig(args);
    const configJson = JSON.stringify(config, null, 2);
    console.log(configJson);
  });

  it("should throw error when pages path is missing", async () => {
    const expectedError: JobResult = new Error("Need page logic path");

    const settings: UserSettings = {
      urls: ["https://dao.ubq.fi"],
      pages: "", // Missing pages path to trigger error
    };

    try {
      console.log(await scrape(settings));
      // If the scrape function does not throw an error, fail the test
      throw new Error("Expected an error but no error was thrown.");
    } catch (error) {
      expect(error).toEqual(expectedError);
    }
  });
});
