import grab from "./fetch-from-supabase";

// const tableName = "GitHub User";

export default async function readDatabase(tableName: string) {
  const data = await grab(tableName, "*");
  return data;
}
