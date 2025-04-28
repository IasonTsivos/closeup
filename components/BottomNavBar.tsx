import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function BottomNavBar() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <View style={styles.navBar}>
      <TouchableOpacity onPress={() => router.push("/map")} style={styles.tab}>
        <Ionicons name="location-sharp" size={24} color={pathname === "/map" ? "#CCFF33" : "white"} />
        <Text style={styles.label}>Map</Text>
      </TouchableOpacity>
      
      <TouchableOpacity onPress={() => router.push("../profile")} style={styles.tab}>
        <Ionicons name="person-outline" size={24} color={pathname === "/profile" ? "#CCFF33" : "white"} />
        <Text style={styles.label}>Profile</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("../settings")} style={styles.tab}>
        <Ionicons name="settings-outline" size={24} color={pathname === "/settings" ? "#CCFF33" : "white"} />
        <Text style={styles.label}>Settings</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  navBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    backgroundColor: "#202020",
    borderTopColor: "#111",
    borderTopWidth: 1,
    position: "absolute",
    bottom: 0,
    width: "100%",
    zIndex: 99,
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    width: 60,
  }  ,
  label: {
    color: "white",
    fontSize: 12,
    marginTop: 2,
  },
});
