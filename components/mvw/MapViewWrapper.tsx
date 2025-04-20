import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

type User = {
  id: string;
  latitude: number;
  longitude: number;
};

export default function MapViewWrapper({
  latitude,
  longitude,
  users = [],
  onUserSelect, // Added prop to handle user selection
}: {
  latitude: number;
  longitude: number;
  users?: User[];
  onUserSelect?: (user: User) => void; // Type for the function prop
}) {
  return (
    <View style={styles.mapContainer}>
      <MapView
        style={StyleSheet.absoluteFill}
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton
        provider={Platform.OS === "web" ? undefined : "google"}
      >
        <Marker
          coordinate={{ latitude, longitude }}
          pinColor="#CCFF33"
          title="You"
        />

        {users.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`User: ${user.id}`}
            pinColor="blue"
            onPress={() => onUserSelect && onUserSelect(user)} // Handle user selection
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    flex: 1,
  },
});
