import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

// If needed: Add your user's location via props
export default function MapViewWrapper({ latitude, longitude }: { latitude: number; longitude: number }) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
        provider={Platform.OS === "web" ? undefined : "google"}
      >
        <Marker coordinate={{ latitude, longitude }} />
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
});
