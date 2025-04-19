import React from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

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

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function MapViewWrapper({ latitude, longitude, users = [] }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBueh9hZSgolOPjNT3kFpjOz9HHnYvnjxw", // Replace with ENV var later!
  });

  const center = {
    lat: latitude,
    lng: longitude,
  };

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      {/* Your location */}
      <Marker position={center} label="You" />

      {/* Nearby users */}
      {users.map((user) => (
        <Marker
          key={user.id}
          position={{ lat: user.latitude, lng: user.longitude }}
          label={user.id[0].toUpperCase()}
        />
      ))}
    </GoogleMap>
  ) : (
    <div>Loading map...</div>
  );
}
