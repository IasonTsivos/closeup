import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  Text,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import MapViewWrapper from "../components/mvw/MapViewWrapper";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "@/components/BottomNavBar";
import { doc, setDoc, serverTimestamp, collection, getDocs, onSnapshot } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getUserId } from "./utils/userId";
import NearbyPeopleList from "./NearbyPeopleList";

type UserLocation = {
  id: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function MapScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPeople, setNearbyPeople] = useState<UserLocation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);

  const fetchNearbyPeople = async () => {
    try {
      const currentLoc = await Location.getCurrentPositionAsync({});
      const userId = await getUserId();

      const snapshot = await getDocs(collection(db, "liveLocations"));
      const people: UserLocation[] = [];

      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.latitude && data.longitude && docSnap.id !== userId) {
          const distance = getDistanceFromLatLonInKm(
            currentLoc.coords.latitude,
            currentLoc.coords.longitude,
            data.latitude,
            data.longitude
          );

          people.push({
            id: docSnap.id,
            latitude: data.latitude,
            longitude: data.longitude,
            distance,
          });
        }
      });

      setNearbyPeople(people);
    } catch (err) {
      console.error("Error fetching nearby people:", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const startLocationFlow = async () => {
      try {
        const { status: fgStatus } = await Location.requestForegroundPermissionsAsync();
        if (fgStatus !== "granted") {
          alert("Foreground location permission is required.");
          return;
        }

        if (Platform.OS !== "web") {
          try {
            const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
            if (bgStatus !== "granted") {
              console.warn("Background location not granted.");
            }
          } catch (bgErr) {
            console.warn("Background location permission not supported:", bgErr);
          }
        }

        const id = await getUserId();
        const initialLoc = await Location.getCurrentPositionAsync({});
        setLocation(initialLoc);
        setLoading(false);

        await setDoc(
          doc(db, "liveLocations", id),
          {
            latitude: initialLoc.coords.latitude,
            longitude: initialLoc.coords.longitude,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        interval = setInterval(async () => {
          try {
            const loc = await Location.getCurrentPositionAsync({});
            await setDoc(
              doc(db, "liveLocations", id),
              {
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
                updatedAt: serverTimestamp(),
              },
              { merge: true }
            );
            console.log("Location updated ✅");
          } catch (err) {
            console.error("Error updating location:", err);
          }
        }, 90000);

        await fetchNearbyPeople();
        onSnapshot(collection(db, "liveLocations"), fetchNearbyPeople);
      } catch (err) {
        console.error("Error starting location flow:", err);
        setLoading(false);
      }
    };

    startLocationFlow();

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  if (loading || !location) {
    return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: "#505050" }} />;
  }

  const handleUserSelect = (user: UserLocation) => {
    setSelectedUser(user);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewWrapper
          key={nearbyPeople.map((p) => p.id).join(",")}
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
          users={nearbyPeople}
          onUserSelect={setSelectedUser}
        />
        <Text style={styles.appTitle}>CloseUp</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#303030" />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.bottomContent} edges={["bottom"]}>
        {selectedUser ? (
          <View style={styles.selectedUserDetails}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToList}>
              <Ionicons name="arrow-back" size={24} color="#303030" />
            </TouchableOpacity>
            <Text style={styles.userName}>{selectedUser.id}</Text>
          </View>
        ) : (
          <NearbyPeopleList people={nearbyPeople} onUserSelect={handleUserSelect} />
        )}
      </SafeAreaView>

      <BottomNavBar />
    </View>
  );
}

const { height } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  mapContainer: {
    height: height * 0.6,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "#CCFF33",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  appTitle: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    color: "#CCFF33",
    zIndex: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 3,
  },
  bottomContent: {
    flex: 1,
    padding: 10,
    backgroundColor: "#101010",
  },
  selectedUserDetails: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202020",
    padding: 20,
    borderRadius: 10,
  },
  userName: {
    color: "#CCFF33",
    fontSize: 24,
    fontWeight: "bold",
  },
});
