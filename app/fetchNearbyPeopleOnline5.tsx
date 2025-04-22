/*const fetchNearbyPeople = async () => {
    try {
      const currentLoc = await Location.getCurrentPositionAsync({});
      const userId = await getUserId();
  
      const snapshot = await getDocs(collection(db, "liveLocations"));
      const people: UserLocation[] = [];
  
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000); // 5 minutes ago
  
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        const updatedAt = data.updatedAt?.toDate?.();
  
        if (
          data.latitude &&
          data.longitude &&
          docSnap.id !== userId &&
          updatedAt &&
          updatedAt >= fiveMinutesAgo
        ) {
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
*/