import React, { useEffect, useState } from "react";
import { View, StyleSheet, ActivityIndicator, Dimensions, TouchableOpacity } from "react-native";
import * as Location from "expo-location";
import MapViewWrapper from "../components/mvw/MapViewWrapper";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

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
      {/* Map fills the top of the screen including the notch */}
      <View style={styles.mapContainer}>
        <MapViewWrapper
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
        />
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#303030" />
        </TouchableOpacity>
      </View>

      {/* Bottom content sits nicely in the safe area */}
      <SafeAreaView style={styles.bottomContent} edges={["bottom"]}>
        {/* You can add other content here */}
      </SafeAreaView>
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
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50, // push it lower to clear the notch
    left: 15,
    backgroundColor: "#CCFF33",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  bottomContent: {
    flex: 1,
    padding: 10,
    backgroundColor: "#101010",
  },
});
