import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { getUserId } from "./utils/userId";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

const INTERESTS = [
  { label: "Music", icon: "musical-notes-outline" },
  { label: "Sports", icon: "basketball-outline" },
  { label: "Tech", icon: "hardware-chip-outline" },
  { label: "Art", icon: "color-palette-outline" },
  { label: "Food", icon: "fast-food-outline" },
  { label: "Gaming", icon: "game-controller-outline" },
  { label: "Travel", icon: "airplane-outline" },
  { label: "Movies", icon: "film-outline" },
  { label: "Fitness", icon: "barbell-outline" },
];

export default function ProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const load = async () => {
      const userId = await getUserId();
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.name) setName(data.name);
        if (data.interests) setSelected(data.interests);
      }
    };
    load();
  }, []);

  const toggleInterest = (label: string) => {
    setSelected((prev) =>
      prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
    );
  };

  const saveProfile = async () => {
    const userId = await getUserId();
    await setDoc(
      doc(db, "users", userId),
      { name, interests: selected },
      { merge: true }
    );
    Alert.alert("Saved", "Your profile has been updated.");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="303030" />
      </TouchableOpacity>

      <Text style={styles.title}>Your Profile</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        value={name}
        placeholderTextColor="#888"
        onChangeText={setName}
      />

      <Text style={styles.subTitle}>Choose Your Interests</Text>

      <ScrollView contentContainerStyle={styles.interestsWrapper}>
        {INTERESTS.map(({ label, icon }) => {
          const isActive = selected.includes(label);
          return (
            <TouchableOpacity
              key={label}
              onPress={() => toggleInterest(label)}
              style={[
                styles.pill,
                {
                  backgroundColor: isActive ? "#CCFF33" : "#EDEDED",
                },
              ]}
            >
              <Ionicons
                name={icon as any}
                size={16}
                color={isActive ? "#101010" : "#555"}
                style={{ marginRight: 6 }}
              />
              <Text style={[styles.pillText, { color: isActive ? "#101010" : "#555" }]}>
                {label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity onPress={saveProfile} style={styles.saveBtn}>
        <Text style={styles.saveBtnText}>Save</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#484848",
    padding: 20,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "#CCFF33",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CCFF33",
    marginBottom: 20,
    alignSelf: "center",
    marginTop: 60,
  },
  input: {
    backgroundColor: "#EDEDED",
    padding: 12,
    borderRadius: 10,
    color: "#000",
    marginBottom: 20,
    fontSize: 16,
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#CCFF33",
    marginBottom: 10,
  },
  interestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    margin: 4,
  },
  pillText: {
    fontSize: 14,
  },
  saveBtn: {
    backgroundColor: "#CCFF33",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  saveBtnText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#101010",
  },
});
