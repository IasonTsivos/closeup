// heatzone-utils.ts
export type User = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

const CLUSTER_DISTANCE_METERS = 300;

export function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3; // meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function clusterUsers(users: User[], distanceMeters = CLUSTER_DISTANCE_METERS): User[][] {
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

export function getClusterCenter(cluster: User[]) {
  const latitude =
    cluster.reduce((sum, user) => sum + user.latitude, 0) / cluster.length;
  const longitude =
    cluster.reduce((sum, user) => sum + user.longitude, 0) / cluster.length;
  return { latitude, longitude };
}

export function getHeatZones(
  users: User[],
  centerLat: number,
  centerLon: number,
  radiusMeters: number = 100
): { latitude: number; longitude: number; count: number }[] {
  const distantUsers = users.filter(
    user => getDistance(centerLat, centerLon, user.latitude, user.longitude) > radiusMeters
  );

  const clusters = clusterUsers(distantUsers);
  const filteredClusters = clusters.filter(cluster => cluster.length > 1);

  return filteredClusters.map(cluster => {
    const center = getClusterCenter(cluster);
    return { ...center, count: cluster.length };
  });
}

