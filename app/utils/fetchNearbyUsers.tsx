import * as Location from "expo-location";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { getUserId } from "./userId";

export type UserLocation = {
  id: string;
  name: string;
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

export const fetchNearbyUsers = async (): Promise<UserLocation[]> => {
  const currentLoc = await Location.getCurrentPositionAsync({});
  const currentUserId = await getUserId();

  const snapshot = await getDocs(collection(db, "liveLocations"));
  const people: UserLocation[] = [];

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const userId = docSnap.id;

    if (
      data.latitude &&
      data.longitude &&
      userId !== currentUserId
    ) {
      const distance = getDistanceFromLatLonInKm(
        currentLoc.coords.latitude,
        currentLoc.coords.longitude,
        data.latitude,
        data.longitude
      );

      let name: string;

      if (typeof data.name === "string") {
        name = data.name;
      } else {
        // fallback: fetch name from users/[id]
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);
        name = userDoc.exists() && userDoc.data().name
          ? userDoc.data().name
          : "Unknown";
      }

      people.push({
        id: userId,
        name,
        latitude: data.latitude,
        longitude: data.longitude,
        distance,
      });
    }
  }

  return people;
};
