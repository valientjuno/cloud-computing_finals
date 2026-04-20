import { ID, Permission, Query, Role, type Models } from "appwrite";
import {
  databaseId,
  entriesTableId,
  collectionsTableId,
  tablesDB,
} from "./appwrite";

export interface AppwriteEntryRow extends Models.Row {
  userId: string;
  title: string;
  content: string;
  mood: string;
  tags?: string[] | null;
  collectionId?: string | null;
}

export interface AppwriteCollectionRow extends Models.Row {
  userId: string;
  name: string;
  emoji: string;
  color: string;
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

type CreateCollectionInput = {
  userId: string;
  name: string;
  emoji: string;
  color: string;
};

type UpdateCollectionInput = {
  name?: string;
  emoji?: string;
  color?: string;
};

export async function fetchEntries(
  userId: string,
): Promise<AppwriteEntryRow[]> {
  const res = await tablesDB.listRows({
    databaseId,
    tableId: entriesTableId,
    queries: [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")],
  });

  return res.rows as unknown as AppwriteEntryRow[];
}

export async function addEntry(data: CreateEntryInput) {
  return await tablesDB.createRow({
    databaseId,
    tableId: entriesTableId,
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
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  });
}

export async function updateEntry(id: string, data: UpdateEntryInput) {
  return await tablesDB.updateRow({
    databaseId,
    tableId: entriesTableId,
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
    tableId: entriesTableId,
    rowId: id,
  });
}

export async function fetchCollections(
  userId: string,
): Promise<AppwriteCollectionRow[]> {
  const res = await tablesDB.listRows({
    databaseId,
    tableId: collectionsTableId,
    queries: [Query.equal("userId", [userId]), Query.orderDesc("$createdAt")],
  });

  return res.rows as unknown as AppwriteCollectionRow[];
}

export async function addCollection(data: CreateCollectionInput) {
  return await tablesDB.createRow({
    databaseId,
    tableId: collectionsTableId,
    rowId: ID.unique(),
    data: {
      userId: data.userId,
      name: data.name,
      emoji: data.emoji,
      color: data.color,
    },
    permissions: [
      Permission.read(Role.user(data.userId)),
      Permission.update(Role.user(data.userId)),
      Permission.delete(Role.user(data.userId)),
    ],
  });
}

export async function updateCollection(
  id: string,
  data: UpdateCollectionInput,
) {
  return await tablesDB.updateRow({
    databaseId,
    tableId: collectionsTableId,
    rowId: id,
    data: {
      ...(data.name !== undefined ? { name: data.name } : {}),
      ...(data.emoji !== undefined ? { emoji: data.emoji } : {}),
      ...(data.color !== undefined ? { color: data.color } : {}),
    },
  });
}

export async function deleteCollection(id: string) {
  return await tablesDB.deleteRow({
    databaseId,
    tableId: collectionsTableId,
    rowId: id,
  });
}
