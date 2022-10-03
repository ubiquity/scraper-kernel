import scrape from "../../../../scrape";

// https://github.com/orgs/surfDB/repositories
// Just navigate a page up to
// https://github.com/orgs/surfDB
export default async (browser, page) => {
  const url = page.url() as string;
  const parts = url.split("/");
  parts.pop(); // remove last part of url
  const pageUp = parts.join("/");
  await scrape(pageUp, browser);
};
