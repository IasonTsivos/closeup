// utils/userId.ts
import * as SecureStore from "expo-secure-store";

// This function will either get an existing ID or generate a new one
export default async function getUserId(): Promise<string> {
  let id = await SecureStore.getItemAsync("userId");

  if (!id) {
    id = Math.random().toString(36).substring(2, 10); // random short ID
    await SecureStore.setItemAsync("userId", id);
    console.log("New user ID created:", id);
  } else {
    console.log("Using stored user ID:", id);
  }

  return id;
}
