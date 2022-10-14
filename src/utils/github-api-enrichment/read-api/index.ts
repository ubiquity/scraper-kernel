import readGitHubApi from "./call-github-api";

export default async function readApi(username?: string) {
  const query = `/users/${username}`;
  console.log(`>> `.concat(query));
  if (!username) {
    throw new Error("no username argument");
  }
  const response = await readGitHubApi(query);
  console.log(response);
}
