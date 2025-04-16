import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity, Text } from "react-native";
import * as Location from "expo-location";
import MapViewWrapper from "../components/mvw/MapViewWrapper";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons"; // optional for an icon-style back button

export default function MapScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert("Permission to access location was denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      setLoading(false);
    })();
  }, []);

  if (loading || !location) {
    return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: "#505050" }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewWrapper
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#303030" />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomContent}>
        {/* Add additional UI here */}
      </View>
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  mapContainer: {
    height: height * 0.6,
    position: "relative", // allows absolutely positioned elements inside
  },
  backButton: {
    position: "absolute",
    top: 20,
    left: 15,
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 20,
  },
  bottomContent: {
    flex: 1,
    padding: 10,
    backgroundColor: "#F5F5F5",
  },
});
