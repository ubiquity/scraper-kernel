import dotenv from "dotenv";
export default function getAccessToken() {
  dotenv.config();
  const GITHUB_PERSONAL_ACCESS_TOKEN = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

  if (!GITHUB_PERSONAL_ACCESS_TOKEN?.length) {
    throw new Error("no github personal access token found");
  }

  return GITHUB_PERSONAL_ACCESS_TOKEN;
}
