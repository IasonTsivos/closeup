import React from "react";
import { StyleSheet, View, Image } from "react-native";
import MapView, { Marker } from "react-native-maps";

type Props = {
  latitude: number;
  longitude: number;
};

export default function MapViewWrapper({ latitude, longitude }: Props) {
  return (
    <View style={styles.container}>
      <MapView
        style={StyleSheet.absoluteFillObject}
        initialRegion={{
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
              source={require("../../assets/avatar.png")} // replace this with your actual avatar asset
              style={styles.avatar}
            />
          </View>
        </Marker>
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
