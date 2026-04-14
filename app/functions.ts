import { ID, Models, Query } from "appwrite";
import { databaseId, databases, collectionId } from "./appwrite";

export interface JournalEntry extends Models.Document {
  userId: string;
  title: string;
  content: string;
  mood: string;
}

type NewEntry = {
  userId: string;
  title: string;
  content: string;
  mood: string;
};

type UpdateEntry = Partial<Omit<NewEntry, "userId">>;

export const fetchEntries = async (
  userId: string,
  searchText = "",
): Promise<JournalEntry[]> => {
  const queries = [Query.equal("userId", userId)];

  const response = await databases.listDocuments<JournalEntry>({
    databaseId,
    collectionId,
    queries,
  });

  const entries = response.documents;

  if (!searchText.trim()) {
    return entries;
  }

  const search = searchText.toLowerCase();

  return entries.filter((entry) => {
    return (
      entry.title.toLowerCase().includes(search) ||
      entry.content.toLowerCase().includes(search) ||
      entry.mood.toLowerCase().includes(search)
    );
  });
};

export const addEntry = async (entry: NewEntry): Promise<JournalEntry> => {
  const response = await databases.createDocument<JournalEntry>({
    databaseId,
    collectionId,
    documentId: ID.unique(),
    data: {
      userId: entry.userId,
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
    },
  });

  return response;
};

export const updateEntry = async (
  entryId: string,
  updatedEntry: UpdateEntry,
): Promise<JournalEntry> => {
  const response = await databases.updateDocument<JournalEntry>({
    databaseId,
    collectionId,
    documentId: entryId,
    data: updatedEntry,
  });

  return response;
};

export const deleteEntry = async (entryId: string): Promise<void> => {
  await databases.deleteDocument({
    databaseId,
    collectionId,
    documentId: entryId,
  });
};
