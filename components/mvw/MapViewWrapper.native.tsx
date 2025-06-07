//mapview-wrapper.native.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  View,
  Text,
  Image,
} from "react-native";
import MapView, { Marker, Circle, Region } from "react-native-maps";

type User = {
  id: string;
  name: string;
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
const CLUSTER_DISTANCE_METERS = 300;

const MIN_BADGE_SIZE = 15;
const MAX_BADGE_SIZE = 40;
const MIN_FONT_SIZE = 10;
const MAX_FONT_SIZE = 22;

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

function clusterUsers(users: User[], distanceMeters: number): User[][] {
  const clusters: User[][] = [];

  users.forEach(user => {
    let added = false;
    for (const cluster of clusters) {
      if (
        cluster.some(cUser =>
          getDistance(cUser.latitude, cUser.longitude, user.latitude, user.longitude) <= distanceMeters
        )
      ) {
        cluster.push(user);
        added = true;
        break;
      }
    }
    if (!added) {
      clusters.push([user]);
    }
  });

  return clusters;
}

function getClusterCenter(cluster: User[]) {
  const latitude =
    cluster.reduce((sum, user) => sum + user.latitude, 0) / cluster.length;
  const longitude =
    cluster.reduce((sum, user) => sum + user.longitude, 0) / cluster.length;
  return { latitude, longitude };
}

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

  // Filter nearby users inside RADIUS_METERS
  const nearbyUsers = users.filter(
    user =>
      getDistance(latitude, longitude, user.latitude, user.longitude) <= RADIUS_METERS
  );

  // Distant users outside RADIUS_METERS
  const distantUsers = users.filter(
    user =>
      getDistance(latitude, longitude, user.latitude, user.longitude) > RADIUS_METERS
  );

  // Cluster distant users by 300m distance
  const clusters = clusterUsers(distantUsers, CLUSTER_DISTANCE_METERS);

  // Filter out clusters with only one user (no cluster for single users)
  const filteredClusters = clusters.filter(cluster => cluster.length > 1);

  // For rendering cluster badges, convert cluster centers to screen coords
  const [clusterPositions, setClusterPositions] = React.useState<
    { x: number; y: number; count: number; key: string }[]
  >([]);

  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const clusterCenters = filteredClusters.map(cluster => getClusterCenter(cluster));

    Promise.all(
      clusterCenters.map(
        center =>
          new Promise<{ x: number; y: number }>((resolve) => {
            mapRef.current?.pointForCoordinate(center).then(resolve);
          })
      )
    ).then(points => {
      const positions = points.map((point, i) => ({
        x: point.x,
        y: point.y,
        count: filteredClusters[i].length,
        key: `cluster-${i}`,
      }));
      setClusterPositions(positions);
    });
  }, [region, filteredClusters]);

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
        {/* Radius circle */}
        <Circle
          center={{ latitude, longitude }}
          radius={RADIUS_METERS}
          strokeColor="rgb(0, 166, 255)"
          fillColor="rgba(0, 123, 255, 0.25)"
        />

        {/* Your avatar */}
        <Marker coordinate={{ latitude, longitude }}zIndex={999}>
          <View style={styles.userLocationMarker}>
            <View style={styles.userLocationInnerCircle} />
          </View>
        </Marker>


        {/* Nearby users (custom pins with the starting letter) with dynamic size */}
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

        {/* Heatzones for clusters */}
        {filteredClusters.map((cluster, idx) => {
          const center = getClusterCenter(cluster);
          return (
            <Circle
              key={`heatzone-${idx}`}
              center={center}
              radius={150} // smaller radius as requested
              strokeColor="rgba(255,0,0,0.5)"
              fillColor="rgba(255,0,0,0.2)"
            />
          );
        })}
      </MapView>

      {/* Cluster count badges */}
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
  width: 45,           // from 30 to 45
  height: 45,
  borderRadius: 22.5,  // half of width/height
  backgroundColor: "rgba(0, 122, 255, 0.3)",
  alignItems: "center",
  justifyContent: "center",
},
userLocationInnerCircle: {
  width: 22,           // from 15 to 22
  height: 22,
  borderRadius: 11,
  backgroundColor: "#007AFF",
  borderWidth: 2,
  borderColor: "white",
},


});
