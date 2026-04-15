import { Account, Client, TablesDB } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const tableId = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID;

if (!endpoint || !projectId || !databaseId || !tableId) {
  throw new Error(
    "Missing Appwrite env vars: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, NEXT_PUBLIC_APPWRITE_DATABASE_ID, or NEXT_PUBLIC_APPWRITE_TABLE_ID.",
  );
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const tablesDB = new TablesDB(client);

export { client, account, tablesDB, databaseId, tableId };
