import { Account, Client, TablesDB } from "appwrite";

function getEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function createAppwrite() {
  const client = new Client()
    .setEndpoint(getEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT"))
    .setProject(getEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID"));

  return {
    client,
    account: new Account(client),
    tablesDB: new TablesDB(client),
    databaseId: getEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID"),
    tableId: getEnv("NEXT_PUBLIC_APPWRITE_TABLE_ID"),
  };
}
