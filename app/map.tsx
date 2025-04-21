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
import { doc, setDoc, serverTimestamp, collection, getDocs, onSnapshot, getDoc } from "firebase/firestore";
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
  const [selectedUserData, setSelectedUserData] = useState<any | null>(null); // User's profile data
  const [fetchingUserData, setFetchingUserData] = useState<boolean>(false);
  const [profileViews, setProfileViews] = useState<number>(0);


  // Fetch nearby people (location data)
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

  // Fetch selected user's data (name, interests, etc.)
  const fetchSelectedUserData = async (userId: string) => {
    setFetchingUserData(true);
    try {
      const userRef = doc(db, "users", userId);
      const docSnap = await getDoc(userRef);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (typeof data.profileViews === "number") setProfileViews(data.profileViews); // 👈 add this
      
  
        // Increment profile views
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

  // Handle user selection from the list
  const handleUserSelect = (user: UserLocation) => {
    setSelectedUser(user);
    fetchSelectedUserData(user.id); // Fetch the selected user's profile data
  };

  // Handle back to list action
  const handleBackToList = () => {
    setSelectedUser(null);
    setSelectedUserData(null); // Clear selected user data when going back to list
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
                <Text style={styles.userName}>{selectedUserData?.name || "Unknown User"}</Text>
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
  backButton2: {
    position: "absolute",
    top: 10,
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
  userDetails: {
    alignItems: "center",
  },
  userName: {
    color: "#CCFF33",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInterestsTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "bold",
  },
  userInterests: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "center",
  },
  interestPill: {
    backgroundColor: "#303030",
    borderRadius: 15,
    padding: 8,
    margin: 5,
  },
  interestText: {
    color: "#CCFF33",
  },
  viewsCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 10,
  },
  
  viewsText: {
    color: "#CCFF33",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
  
});
