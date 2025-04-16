import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const storage = {
  getItem: async (key: string) => {
    return Platform.OS === "web"
      ? await AsyncStorage.getItem(key)
      : await SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    return Platform.OS === "web"
      ? await AsyncStorage.setItem(key, value)
      : await SecureStore.setItemAsync(key, value);
  },
};

export async function getUserId(): Promise<string> {
  let id = await storage.getItem("userId");

  if (!id) {
    id = Math.random().toString(36).substring(2, 10);
    await storage.setItem("userId", id);
    console.log("New user ID created:", id);
  } else {
    console.log("Using stored user ID:", id);
  }

  return id;
}
