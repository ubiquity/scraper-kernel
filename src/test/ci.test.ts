import scrape from "../scrape";

test("scrape", async () => {
  const result = await scrape({
    urls: "https://www.google.com",
    pagesDirectory: "test",
  });
  expect(result).toBe("hello");
});
