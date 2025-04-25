import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";
import { getDistance } from "./location"; // adjust path

type User = {
  id: string;
  latitude: number;
  longitude: number;
};

export default function MapViewWrapper({
  latitude,
  longitude,
  users = [],
  onUserSelect,
}: {
  latitude: number;
  longitude: number;
  users?: User[];
  onUserSelect?: (user: User) => void;
}) {
  const NEARBY_RADIUS = 500;

  const nearbyUsers = users.filter(
    (user) =>
      getDistance(latitude, longitude, user.latitude, user.longitude) <= NEARBY_RADIUS
  );
  const distantUsers = users.filter(
    (user) =>
      getDistance(latitude, longitude, user.latitude, user.longitude) > NEARBY_RADIUS
  );

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

        {nearbyUsers.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`User: ${user.id}`}
            pinColor="blue"
            onPress={() => onUserSelect?.(user)}
          />
        ))}

        {distantUsers.map((user) => (
          <Circle
            key={`zone-${user.id}`}
            center={{ latitude: user.latitude, longitude: user.longitude }}
            radius={100}
            strokeColor="rgba(255,0,0,0.3)"
            fillColor="rgba(255,0,0,0.1)"
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
