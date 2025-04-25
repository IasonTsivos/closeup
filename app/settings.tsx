import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [privateProfile, setPrivateProfile] = useState(false);
  const router = useRouter();

  const toggleNotifications = () => setNotificationsEnabled((prev) => !prev);
  const togglePrivacy = () => setPrivateProfile((prev) => !prev);

  const handleLogout = () => {
    Alert.alert("Logged out", "You have been signed out.");
    router.replace("/"); // Change this to your login or home screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#303030" />
      </TouchableOpacity>

      <View style={styles.titleWrapper}>
        <Ionicons name="settings-outline" size={24} color="#CCFF33" />
        <Text style={styles.title}>Settings</Text>
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>Enable Notifications</Text>
        <Switch
          trackColor={{ false: "#555", true: "#CCFF33" }}
          thumbColor="#101010"
          onValueChange={toggleNotifications}
          value={notificationsEnabled}
        />
      </View>

      <View style={styles.option}>
        <Text style={styles.optionText}>Private Profile</Text>
        <Switch
          trackColor={{ false: "#555", true: "#CCFF33" }}
          thumbColor="#101010"
          onValueChange={togglePrivacy}
          value={privateProfile}
        />
      </View>

      <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#101010",
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
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 60,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#CCFF33",
    marginLeft: 8,
  },
  option: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#202020",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
  },
  optionText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutBtn: {
    marginTop: 40,
    backgroundColor: "#CCFF33",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  logoutText: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#101010",
  },
});
