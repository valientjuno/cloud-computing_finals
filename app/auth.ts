import { ID } from "appwrite";
import { account } from "./appwrite";

export async function registerUser(
  name: string,
  email: string,
  password: string,
) {
  await account.create(ID.unique(), email, password, name);
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

export async function loginUser(email: string, password: string) {
  await account.createEmailPasswordSession(email, password);
  return await account.get();
}

export async function getCurrentUser() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function logoutUser() {
  try {
    await account.deleteSession("current");
  } catch {
    return null;
  }
}
