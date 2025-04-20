import React from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

type User = {
  id: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

type Props = {
  people: User[];
  onUserSelect: (user: User) => void;
};

export default function NearbyPeopleList({ people, onUserSelect }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Nearby People</Text>

      {people.length === 0 ? (
        <Text style={styles.noPeopleText}>No nearby users found.</Text>
      ) : (
        <FlatList
          data={people}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.personBox} onPress={() => onUserSelect(item)}>
              <View style={styles.row}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.id.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                  <Text style={styles.name}>{item.id}</Text>
                  <Text style={styles.distance}>
                    {item.distance !== undefined
                      ? `${item.distance.toFixed(2)} km away`
                      : "Distance unknown"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#CCFF33",
    fontWeight: "bold",
    fontSize: 16,
  },
  personBox: {
    backgroundColor: "#202020",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    color: "#CCFF33",
    fontWeight: "bold",
  },
  distance: {
    color: "#bbb",
  },
  noPeopleText: {
    color: "#888",
    fontStyle: "italic",
  },
});
