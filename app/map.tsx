import React, { useEffect, useState } from "react";
import {
  View,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Platform,
  Linking,
} from "react-native";
import * as Location from "expo-location";
import MapViewWrapper from "../components/mvw/MapViewWrapper"; // your updated wrapper
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomNavBar from "@/components/BottomNavBar";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  onSnapshot,
  getDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getUserId } from "./utils/userId";
import NearbyPeopleList from "./NearbyPeopleList";
import { UserLocation } from "./utils/fetchNearbyUsers";
import { styles as externalStyles } from "./utils/MapScreen.styles";
import { LinearGradient } from "expo-linear-gradient";

export default function MapScreen() {
  const navigation = useNavigation();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [nearbyPeople, setNearbyPeople] = useState<UserLocation[]>([]);
  const [connections, setConnections] = useState<UserLocation[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserLocation | null>(null);
  const [selectedUserData, setSelectedUserData] = useState<any | null>(null);
  const [fetchingUserData, setFetchingUserData] = useState<boolean>(false);
  const [profileViews, setProfileViews] = useState<number>(0);

  // Calculate distance between two lat/lng points (Haversine formula)
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleExitButtonPress = (username: string) => {
    const instagramUrl = `https://www.instagram.com/${username}/`;
    Linking.openURL(instagramUrl).catch((err) => {
      console.error("Error opening Instagram:", err);
    });
  };

  const fetchConnections = async () => {
    try {
      const userId = await getUserId();
      const connectionsSnapshot = await getDocs(
        collection(db, `users/${userId}/connections`)
      );
      const connectedUsers: UserLocation[] = [];

      connectionsSnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (
          data.latitude !== undefined &&
          data.longitude !== undefined &&
          data.name !== undefined
        ) {
          connectedUsers.push({
            id: docSnap.id,
            name: data.name,
            latitude: data.latitude,
            longitude: data.longitude,
            distance: data.distance,
          });
        }
      });

      setConnections(connectedUsers);
    } catch (error) {
      console.error("Error fetching connections:", error);
    }
  };

  const fetchSelectedUserData = async (userId: string) => {
    setFetchingUserData(true);
    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.profileViews === "number")
          setProfileViews(data.profileViews);
        const currentViews = data.profileViews || 0;
        await setDoc(
          userRef,
          { profileViews: currentViews + 1 },
          { merge: true }
        );

        setSelectedUserData({ ...data, profileViews: currentViews + 1 });
      } else {
        console.error("User not found");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
    setFetchingUserData(false);
  };

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    const startLocationFlow = async () => {
      try {
        const userId = await getUserId();
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

        // Fetch connections once on mount
        await fetchConnections();

        // Listen to location updates in real-time and update nearbyPeople
          const unsubscribe = onSnapshot(collection(db, "liveLocations"), (snapshot) => {
          const users: UserLocation[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data();
            const docId = docSnap.id;
            if (
              typeof data.latitude === "number" &&
              typeof data.longitude === "number" &&
              docId !== userId // <-- Exclude yourself here
            ) {
              const distance = calculateDistance(
                initialLoc.coords.latitude,
                initialLoc.coords.longitude,
                data.latitude,
                data.longitude
              );
              users.push({
                id: docId,
                name: docId, // or fetch name if available
                latitude: data.latitude,
                longitude: data.longitude,
                distance,
              });
            }
          });
          setNearbyPeople(users);
        });

        return unsubscribe;
      } catch (err) {
        console.error("Error starting location flow:", err);
        setLoading(false);
      }
    };

    const cleanupPromise = startLocationFlow();

    return () => {
      if (interval) clearInterval(interval);
      cleanupPromise.then((unsubscribe) => {
        if (typeof unsubscribe === "function") unsubscribe();
      });
    };
  }, []);

  const handleUserSelect = (user: UserLocation) => {
    setSelectedUser(user);
    fetchSelectedUserData(user.id);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setSelectedUserData(null);
  };

  if (loading || !location || nearbyPeople.length === 0) {
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, backgroundColor: "#505050" }}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewWrapper
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
          users={nearbyPeople}
          onUserSelect={handleUserSelect}
        />
        <Text style={styles.appTitle}>CloseUp</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#303030" />
        </TouchableOpacity>
      </View>

      <SafeAreaView style={styles.bottomContent} edges={["bottom"]}>
        {selectedUser ? (
          <View style={styles.selectedUserDetails}>
            <View style={styles.viewsCounter}>
              <Ionicons name="eye-outline" size={20} color="#CCFF33" />
              <Text style={styles.viewsText}>{profileViews}</Text>
            </View>
            <TouchableOpacity
              style={styles.backButton2}
              onPress={handleBackToList}
            >
              <Ionicons name="arrow-back" size={24} color="#303030" />
            </TouchableOpacity>
            {fetchingUserData ? (
              <ActivityIndicator size="large" color="#CCFF33" />
            ) : (
              <View style={styles.userDetails}>
                <LinearGradient
                  colors={[
                    "rgba(255, 214, 0, 0.8)",
                    "rgba(230, 104, 60, 0.8)",
                    "rgba(220, 39, 67, 0.8)",
                    "rgba(211, 0, 197, 0.8)",
                    "rgba(118, 56, 250, 0.8)",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.instagramBadge}
                >
                  <Ionicons
                    name="logo-instagram"
                    size={28}
                    color="#fff"
                    style={{ marginRight: 8 }}
                  />

                  <Text style={styles.username}>
                    @{selectedUserData?.name || "Unknown User"}
                  </Text>

                  <TouchableOpacity
                    onPress={() =>
                      handleExitButtonPress(selectedUserData?.name)
                    }
                  >
                    <Ionicons
                      name="open-outline"
                      size={24}
                      color="#fff"
                      style={{ marginLeft: 8 }}
                    />
                  </TouchableOpacity>
                </LinearGradient>

                <Text style={styles.userInterestsTitle}>Interests:</Text>
                <View style={styles.userInterests}>
                  {selectedUserData?.interests?.map(
                    (interest: string, index: number) => (
                      <View key={index} style={styles.interestPill}>
                        <Text style={styles.interestText}>{interest}</Text>
                      </View>
                    )
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <NearbyPeopleList
            people={nearbyPeople}
            connections={connections}
            onUserSelect={handleUserSelect}
          />
        )}
      </SafeAreaView>

      <BottomNavBar />
    </View>
  );
}

const styles = {
  ...externalStyles,
};
