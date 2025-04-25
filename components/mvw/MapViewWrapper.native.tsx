import React from "react";
import { StyleSheet, View, Image } from "react-native";
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
        region={{
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        {/* Radius circle */}
        <Circle
          center={{ latitude, longitude }}
          radius={RADIUS_METERS}
          strokeColor="rgba(0, 122, 255, 0.4)"
          fillColor="rgba(0, 122, 255, 0.1)"
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

        {/* Nearby users (within radius) */}
        {nearbyUsers.map(user => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`User: ${user.id}`}
            pinColor="blue"
            onPress={() => onUserSelect?.(user)}
          />
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
});
