import React from "react";
import { GoogleMap, Marker, Circle, useJsApiLoader } from "@react-google-maps/api";
import { getDistance } from "./location"; // adjust path if needed

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

const NEARBY_RADIUS = 500;

const containerStyle = {
  width: "100%",
  height: "100%",
};

export default function MapViewWrapper({ latitude, longitude, users = [] }: Props) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: "AIzaSyBueh9hZSgolOPjNT3kFpjOz9HHnYvnjxw", // TODO: replace with ENV
  });

  const center = {
    lat: latitude,
    lng: longitude,
  };

  const nearbyUsers = users.filter(
    (user) =>
      getDistance(latitude, longitude, user.latitude, user.longitude) <= NEARBY_RADIUS
  );
  const distantUsers = users.filter(
    (user) =>
      getDistance(latitude, longitude, user.latitude, user.longitude) > NEARBY_RADIUS
  );

  return isLoaded ? (
    <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={15}>
      <Marker position={center} label="You" />

      {nearbyUsers.map((user) => (
        <Marker
          key={user.id}
          position={{ lat: user.latitude, lng: user.longitude }}
          label={user.id[0].toUpperCase()}
        />
      ))}

      {distantUsers.map((user) => (
        <Circle
          key={`zone-${user.id}`}
          center={{ lat: user.latitude, lng: user.longitude }}
          radius={100}
          options={{
            strokeColor: "rgba(255, 0, 0, 0.3)",
            fillColor: "rgba(255, 0, 0, 0.1)",
            strokeWeight: 1,
          }}
        />
      ))}
    </GoogleMap>
  ) : (
    <div>Loading map...</div>
  );
}
