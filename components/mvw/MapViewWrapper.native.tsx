import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";
import { getHeatZones, getDistance, User } from "../../app/utils/heatzone-utils";

type Props = {
  latitude: number;
  longitude: number;
  users?: User[];
  onUserSelect?: (user: User) => void;
};

const RADIUS_METERS = 100;
const MIN_BADGE_SIZE = 15;
const MAX_BADGE_SIZE = 40;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 22;

function interpolateSize(delta: number) {
  const minDelta = 0.005;
  const maxDelta = 0.05;
  const t = Math.min(Math.max((delta - minDelta) / (maxDelta - minDelta), 0), 1);
  const size = MAX_BADGE_SIZE - t * (MAX_BADGE_SIZE - MIN_BADGE_SIZE);
  const fontSize = MAX_FONT_SIZE - t * (MAX_FONT_SIZE - MIN_FONT_SIZE);
  return { size, fontSize };
}

export default function MapViewWrapper({
  latitude,
  longitude,
  users = [],
  onUserSelect,
}: Props) {
  const [region, setRegion] = useState<Region>({
    latitude,
    longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const nearbyUsers = users.filter(
    user =>
      getDistance(latitude, longitude, user.latitude, user.longitude) <= RADIUS_METERS
  );

  const heatzones = getHeatZones(users, latitude, longitude, RADIUS_METERS);

  const [clusterPositions, setClusterPositions] = useState<
    { x: number; y: number; count: number; key: string }[]
  >([]);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    Promise.all(
      heatzones.map(
        zone =>
          new Promise<{ x: number; y: number }>((resolve) => {
            mapRef.current?.pointForCoordinate({ latitude: zone.latitude, longitude: zone.longitude }).then(resolve);
          })
      )
    ).then(points => {
      const positions = points.map((point, i) => ({
        x: point.x,
        y: point.y,
        count: heatzones[i].count, // ✅ fixed: use actual count
        key: `cluster-${i}`,
      }));
      setClusterPositions(positions);
    });
  }, [region, heatzones]);

  const { size: nearbyPinSize, fontSize: nearbyPinFontSize } = interpolateSize(region.latitudeDelta);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFillObject}
        initialRegion={region}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation={false}
        showsMyLocationButton={false}
      >
        <Circle
          center={{ latitude, longitude }}
          radius={RADIUS_METERS}
          strokeColor="rgb(0, 166, 255)"
          fillColor="rgba(0, 123, 255, 0.25)"
        />

        <Marker coordinate={{ latitude, longitude }} zIndex={999}>
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationInnerCircle} />
          </View>
        </Marker>

        {nearbyUsers.map(user => (
          <Marker
            key={user.id}
            coordinate={{ latitude: user.latitude, longitude: user.longitude }}
            title={`${user.name}`}
            pinColor="blue"
            onPress={() => onUserSelect?.(user)}
            zIndex={1}
          >
            <View
              style={[
                styles.customPin,
                styles.nearbyPin,
                {
                  width: nearbyPinSize,
                  height: nearbyPinSize,
                  borderRadius: nearbyPinSize / 2,
                  borderColor: "#CCFF33",
                  borderWidth: 2,
                },
              ]}
            >
              <Text
                style={[
                  styles.pinText,
                  { fontSize: nearbyPinFontSize },
                ]}
              >
                {user.name.charAt(0)}
              </Text>
            </View>
          </Marker>
        ))}

        {heatzones.map((zone, idx) => (
          <Circle
            key={`heatzone-${idx}`}
            center={{ latitude: zone.latitude, longitude: zone.longitude }}
            radius={150}
            strokeColor="rgba(255,0,0,0.5)"
            fillColor="rgba(255,0,0,0.2)"
          />
        ))}
      </MapView>

      {clusterPositions.map(({ x, y, count, key }) => {
        const { size, fontSize } = interpolateSize(region.latitudeDelta);

        return (
          <View
            key={key}
            style={[
              styles.clusterBadge,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                left: x - size / 2,
                top: y - size / 2,
                zIndex: 1,
              },
            ]}
            pointerEvents="none"
          >
            <Text style={[styles.clusterText, { fontSize }]}>{count}</Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  customPin: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#3388FF",
  },
  pinText: {
    color: "#CCFF33",
    fontWeight: "300",
  },
  nearbyPin: {
    backgroundColor: "#303030",
  },
  clusterBadge: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
  },
  clusterText: {
    color: "rgba(255,0,0,1)",
    fontWeight: "300",
  },
  userLocationMarker: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(0, 122, 255, 0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  userLocationInnerCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#007AFF",
    borderWidth: 2,
    borderColor: "white",
  },
});
