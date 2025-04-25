import * as Location from "expo-location";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; 
import { getUserId } from "./userId"; 

export type UserLocation = {
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

export const fetchNearbyUsers = async (): Promise<UserLocation[]> => {
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

  return people;
};
