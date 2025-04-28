import React from "react";
import { StyleSheet, View, Text, Image } from "react-native";
import MapView, { Marker, Circle } from "react-native-maps";

type User = {
  id: string;
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  users?: User[];
  onUserSelect?: (user: User) => void;
};

const RADIUS_METERS = 500;

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default function MapViewWrapper({ latitude, longitude, users = [], onUserSelect }: Props) {
  const nearbyUsers = users.filter(
    user =>
      getDistance(latitude, longitude, user.latitude, user.longitude) <= RADIUS_METERS
  );

  const distantUsers = users.filter(
    user =>
      getDistance(latitude, longitude, user.latitude, user.longitude) > RADIUS_METERS
  );

  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
          latitude,
          longitude,
          latitudeDelta: 0.01, // Adjust the zoom level if necessary
          longitudeDelta: 0.01, // Adjust the zoom level if necessary
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Radius circle */}
        <Circle
          center={{ latitude, longitude }}
          radius={RADIUS_METERS}
          strokeColor="rgb(0, 166, 255)"
          fillColor="rgba(0, 123, 255, 0.25)"
        />

        {/* Your avatar */}
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.customMarker}>
            <Image
              source={require("../../assets/avatar.png")}
              style={styles.avatar}
              resizeMode="cover"
            />
          </View>
        </Marker>

        {/* Nearby users (custom pins with the starting letter) */}
        {nearbyUsers.map(user => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`User: ${user.id}`}
            pinColor="blue"
            onPress={() => onUserSelect?.(user)}
            zIndex={1} // Ensure the nearby pins are above the map
          >
            <View style={[styles.customPin, styles.nearbyPin]}>
              <Text style={styles.pinText}>{user.id.charAt(0).toUpperCase()}</Text>
            </View>
          </Marker>
        ))}

        {/* Distant users (render heat markers) */}
        {distantUsers.map(user => (
          <Circle
            key={`heat-${user.id}`}
            center={{ latitude: user.latitude, longitude: user.longitude }}
            radius={100}
            strokeColor="rgba(255,0,0,0.5)"
            fillColor="rgba(255,0,0,0.2)"
          />
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  customMarker: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    padding: 2,
    borderWidth: 1,
    borderColor: "#333",
    width: 48,
    height: 48,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  customPin: {
    justifyContent: "center",
    alignItems: "center",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#3388FF", // Blue background for the custom pin
    borderWidth: 2,
    borderColor: "#CCFF33", // White border for the pin
  },
  pinText: {
    color: "#CCFF33",
    fontWeight: "bold",
    fontSize: 18,
  },
  nearbyPin: {
    backgroundColor: "#303030", // Change this color if needed
  },
});
