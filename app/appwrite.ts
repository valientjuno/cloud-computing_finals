import { Account, Client, TablesDB } from "appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT;
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;
const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID;
const tableId = process.env.NEXT_PUBLIC_APPWRITE_TABLE_ID;

if (!endpoint) throw new Error("Missing NEXT_PUBLIC_APPWRITE_ENDPOINT");
if (!projectId) throw new Error("Missing NEXT_PUBLIC_APPWRITE_PROJECT_ID");
if (!databaseId) throw new Error("Missing NEXT_PUBLIC_APPWRITE_DATABASE_ID");
if (!tableId) throw new Error("Missing NEXT_PUBLIC_APPWRITE_TABLE_ID");

const client = new Client().setEndpoint(endpoint).setProject(projectId);

const account = new Account(client);
const tablesDB = new TablesDB(client);

export { client, account, tablesDB };
export const DATABASE_ID: string = databaseId;
export const TABLE_ID: string = tableId;
