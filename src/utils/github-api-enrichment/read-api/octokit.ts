import { Octokit, App } from "octokit";
import getAccessToken from "./get-access-token";
// Create a personal access token at https://github.com/settings/tokens/new?scopes=repo
const octokit = new Octokit({
  auth: getAccessToken(),
  userAgent: "@ubiquity/scraper",
});

async function main() {
  // Compare: https://docs.github.com/en/rest/reference/users#get-the-authenticated-user
  const response = await octokit.rest.users.getAuthenticated();
  console.log(response);
}

main();
