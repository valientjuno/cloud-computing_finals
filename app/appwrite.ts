import { Account, Client, TablesDB } from "appwrite";

const endpoint: string = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT as string;
if (!endpoint) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_APPWRITE_ENDPOINT",
  );
}

const projectId: string = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID as string;
if (!projectId) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_APPWRITE_PROJECT_ID",
  );
}

export const databaseId: string = process.env
  .NEXT_PUBLIC_APPWRITE_DATABASE_ID as string;
if (!databaseId) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_APPWRITE_DATABASE_ID",
  );
}

export const entriesTableId: string = process.env
  .NEXT_PUBLIC_APPWRITE_TABLE_ID as string;
if (!entriesTableId) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_APPWRITE_TABLE_ID",
  );
}

export const collectionsTableId: string = process.env
  .NEXT_PUBLIC_APPWRITE_COLLECTIONS_TABLE_ID as string;
if (!collectionsTableId) {
  throw new Error(
    "Missing required environment variable: NEXT_PUBLIC_APPWRITE_COLLECTIONS_TABLE_ID",
  );
}

const client = new Client().setEndpoint(endpoint).setProject(projectId);

export const account = new Account(client);
export const tablesDB = new TablesDB(client);

export { client };
