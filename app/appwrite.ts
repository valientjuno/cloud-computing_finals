import { Account, Client, TablesDB } from "appwrite";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

const endpoint = requireEnv("NEXT_PUBLIC_APPWRITE_ENDPOINT");
const projectId = requireEnv("NEXT_PUBLIC_APPWRITE_PROJECT_ID");
const databaseId = requireEnv("NEXT_PUBLIC_APPWRITE_DATABASE_ID");
const tableId = requireEnv("NEXT_PUBLIC_APPWRITE_TABLE_ID");

const client = new Client().setEndpoint(endpoint).setProject(projectId);
const account = new Account(client);
const tablesDB = new TablesDB(client);

export { client, account, tablesDB, databaseId, tableId };
