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
import { doc, setDoc, serverTimestamp, collection, onSnapshot, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { getUserId } from "./utils/userId";
import NearbyPeopleList from "./NearbyPeopleList";
import { fetchNearbyUsers, UserLocation } from "./utils/fetchNearbyUsers"; 
import { styles as externalStyles } from "./utils/MapScreen.styles"; // your other styles
import { LinearGradient } from 'expo-linear-gradient';
import { Linking } from 'react-native';

function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of Earth in km
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
  const [selectedUserData, setSelectedUserData] = useState<any | null>(null);
  const [fetchingUserData, setFetchingUserData] = useState<boolean>(false);
  const [profileViews, setProfileViews] = useState<number>(0);

  const handleExitButtonPress = (username: string) => {
    const instagramUrl = `https://www.instagram.com/${username}/`; 
    Linking.openURL(instagramUrl).catch((err) => {
      console.error("Error opening Instagram:", err);
    });
  };

  const fetchNearbyPeople = async () => {
    try {
      const people = await fetchNearbyUsers();
      setNearbyPeople(people);
    } catch (err) {
      console.error("Error fetching nearby users:", err);
    }
  };

  const fetchSelectedUserData = async (userId: string) => {
    setFetchingUserData(true);
    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.profileViews === "number") setProfileViews(data.profileViews);
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

  const handleUserSelect = (user: UserLocation) => {
    setSelectedUser(user);
    fetchSelectedUserData(user.id);
  };

  const handleBackToList = () => {
    setSelectedUser(null);
    setSelectedUserData(null);
  };

  if (loading || !location) {
    return <ActivityIndicator size="large" style={{ flex: 1, backgroundColor: "#505050" }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <MapViewWrapper
          key={nearbyPeople.map((p) => p.id).join(",")}
          latitude={location.coords.latitude}
          longitude={location.coords.longitude}
          users={nearbyPeople}
          onUserSelect={handleUserSelect}
        />
        <Text style={styles.appTitle}>CloseUp</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
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
            <TouchableOpacity style={styles.backButton2} onPress={handleBackToList}>
              <Ionicons name="arrow-back" size={24} color="#303030" />
            </TouchableOpacity>
            {fetchingUserData ? (
              <ActivityIndicator size="large" color="#CCFF33" />
            ) : (
            <View style={styles.userDetails}>
                <LinearGradient
                  colors={[
                    "rgba(255, 214, 0, 0.8)",  // "#ffd600" but 60% opacity
                    "rgba(230, 104, 60, 0.8)", // "#e6683c"
                    "rgba(220, 39, 67, 0.8)",  // "#dc2743"
                    "rgba(211, 0, 197, 0.8)",  // "#d300c5"
                    "rgba(118, 56, 250, 0.8)", // "#7638fa"
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.instagramBadge}
                >

                <Ionicons name="logo-instagram" size={28} color="#fff" style={{ marginRight: 8 }} />

                <Text style={styles.username}>
                  @{selectedUserData?.name || "Unknown User"}
                </Text>

                <TouchableOpacity onPress={() => handleExitButtonPress(selectedUserData?.name)}>
                  <Ionicons name="exit-outline" size={24} color="#fff" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              </LinearGradient>

                <Text style={styles.userInterestsTitle}>Interests:</Text>
                <View style={styles.userInterests}>
                  {selectedUserData?.interests?.map((interest: string, index: number) => (
                    <View key={index} style={styles.interestPill}>
                      <Text style={styles.interestText}>{interest}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          <NearbyPeopleList people={nearbyPeople} onUserSelect={handleUserSelect} />
        )}
      </SafeAreaView>

      <BottomNavBar />
    </View>
  );
}


// Merge your original styles + new ones here:
const styles = {
  ...externalStyles,

};