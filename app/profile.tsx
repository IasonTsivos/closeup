import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
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
  const [profileViews, setProfileViews] = useState<number>(0);
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
        if (data.profileViews !== undefined) setProfileViews(data.profileViews);
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
    router.push("/map");
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#303030" />
      </TouchableOpacity>
      <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={styles.settingsBtn}
        >
          <Ionicons name="settings-outline" size={24} color="#CCFF33" />
        </TouchableOpacity>

      <View style={styles.contentWrapper}>
        <View style={styles.titleWrapper}>
          <Ionicons name="sparkles-outline" size={24} color="#CCFF33" />
          <Text style={styles.title}>Profile</Text>
        </View>

        <TextInput
          editable={false}
          style={styles.input}
          placeholder="Enter your name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.subTitle}>Select Interests</Text>

        <ScrollView
          contentContainerStyle={styles.interestsWrapper}
          showsVerticalScrollIndicator={false}
        >
          {INTERESTS.map(({ label, icon }) => {
            const isActive = selected.includes(label);
            return (
              <TouchableOpacity
                key={label}
                onPress={() => toggleInterest(label)}
                style={[
                  styles.pill,
                  { backgroundColor: isActive ? "#CCFF33" : "#333" },
                ]}
              >
                <Ionicons
                  name={icon as any}
                  size={16}
                  color={isActive ? "#101010" : "#ccc"}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.pillText,
                    { color: isActive ? "#101010" : "#ccc" },
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.profileViewsContainer}>
          <Ionicons name="eye-outline" size={25} color="#CCFF33" />
          <Text style={styles.profileViewsText}>{profileViews || 0}</Text>
        </View>

        <TouchableOpacity onPress={saveProfile} style={styles.saveBtn}>
          <Text style={styles.saveBtnText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
    padding: 20,
  },
  contentWrapper: {
    flex: 1,
    justifyContent: "flex-start",      // changed from center to flex-start
    alignItems: "center",
    paddingTop: 60,                    // added some space from the top
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
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,                 // increased margin bottom for spacing between title & input
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CCFF33",
    marginLeft: 8,
  },
  input: {
    backgroundColor: "#202020",
    padding: 12,
    borderRadius: 10,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
    width: 280,
  },
  subTitle: {
    paddingTop: 10,
    paddingBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
    // Removed alignSelf here to override in JSX inline styles
  },
  interestsWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 20,
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
    width: 200,
  },
  saveBtnText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#101010",
  },
  profileViewsContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  profileViewsText: {
    color: "#CCFF33",
    marginLeft: 5,
    fontSize: 18,
  },
  settingsBtn: {
  position: "absolute",
  top: 60,
  right: 15,
  backgroundColor: "transparent", // optional: remove if you want a background
  padding: 10,
  borderRadius: 20,
  zIndex: 10,
},

});

