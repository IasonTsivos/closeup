import React from "react";
import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";

type User = {
  id: string;
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  users?: User[]; 
};

export default function MapViewWrapper({ latitude, longitude, users = [] }: Props) {
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
        <Marker coordinate={{ latitude, longitude }}>
          <View style={styles.customMarker}>
            <Image
              source={require("../../assets/avatar.png")}
              style={styles.avatar}
            />
          </View>
        </Marker>

        {users.map((user) => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`User: ${user.id}`}
            pinColor="blue"
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
    padding: 4,
    borderWidth: 2,
    borderColor: "#101010",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
});
