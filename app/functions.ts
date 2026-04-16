import { ID, Permission, Query, Role, type Models } from "appwrite";
import { databaseId, tableId, tablesDB } from "./appwrite";

export interface AppwriteEntryRow extends Models.Row {
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags?: string[] | null;
  collectionId?: string | null;
}

type CreateEntryInput = {
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags?: string[];
  collectionId?: string | null;
};

type UpdateEntryInput = {
  title?: string;
  content?: string;
  mood?: string;
  tags?: string[];
  collectionId?: string | null;
};

export async function fetchEntries(
  userId: string,
): Promise<AppwriteEntryRow[]> {
  const res = await tablesDB.listRows<AppwriteEntryRow>({
    databaseId,
    tableId,
    queries: [Query.equal("userId", userId), Query.orderDesc("$createdAt")],
  });

  return res.rows;
}

export async function addEntry(data: CreateEntryInput) {
  return await tablesDB.createRow({
    databaseId,
    tableId,
    rowId: ID.unique(),
    data: {
      userId: data.userId,
      title: data.title,
      content: data.content,
      mood: data.mood,
      tags: data.tags ?? [],
      collectionId: data.collectionId ?? null,
    },
    permissions: [
      Permission.read(Role.any()),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  });
}

export async function updateEntry(id: string, data: UpdateEntryInput) {
  return await tablesDB.updateRow({
    databaseId,
    tableId,
    rowId: id,
    data: {
      ...(data.title !== undefined ? { title: data.title } : {}),
      ...(data.content !== undefined ? { content: data.content } : {}),
      ...(data.mood !== undefined ? { mood: data.mood } : {}),
      ...(data.tags !== undefined ? { tags: data.tags } : {}),
      ...(data.collectionId !== undefined
        ? { collectionId: data.collectionId }
        : {}),
    },
  });
}

export async function deleteEntry(id: string) {
  return await tablesDB.deleteRow({
    databaseId,
    tableId,
    rowId: id,
  });
}
