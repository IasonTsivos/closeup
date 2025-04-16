import React from "react";
import { View, StyleSheet } from "react-native";

type Props = {
  latitude: number;
  longitude: number;
};

export default function MapViewWrapper({ latitude, longitude }: Props) {
  const mapSrc = `https://www.google.com/maps/embed/v1/view?key=AIzaSyBueh9hZSgolOPjNT3kFpjOz9HHnYvnjxw&center=${latitude},${longitude}&zoom=15`;

  return (
    <View style={styles.webContainer}>
      <iframe
        src={mapSrc}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});
