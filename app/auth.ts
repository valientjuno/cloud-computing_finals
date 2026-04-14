import { ID, Models } from "appwrite";
import { account } from "./appwrite";

export type AuthUser = Models.User<Models.Preferences>;

export const registerUser = async (
  name: string,
  email: string,
  password: string,
) => {
  await account.create({
    userId: ID.unique(),
    email,
    password,
    name,
  });

  return await account.createEmailPasswordSession({
    email,
    password,
  });
};

export const loginUser = async (email: string, password: string) => {
  return await account.createEmailPasswordSession({
    email,
    password,
  });
};

export const logoutUser = async () => {
  return await account.deleteSession({
    sessionId: "current",
  });
};

export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    return await account.get();
  } catch {
    return null;
  }
};

export const sendPasswordRecovery = async (email: string) => {
  const resetUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/reset-password`
      : "http://localhost:3000/reset-password";

  return await account.createRecovery({
    email,
    url: resetUrl,
  });
};

export const completePasswordRecovery = async (
  userId: string,
  secret: string,
  password: string,
) => {
  return await account.updateRecovery({
    userId,
    secret,
    password,
  });
};
