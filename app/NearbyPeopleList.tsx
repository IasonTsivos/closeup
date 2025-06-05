import React, { useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type User = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

type Props = {
  people: User[]; // nearby + heatzones combined, maybe
  connections: User[]; // new prop for connected users
  onUserSelect: (user: User) => void;
};

export default function NearbyPeopleList({ people, connections, onUserSelect }: Props) {
  const [activeTab, setActiveTab] = useState<"nearby" | "heatzones" | "connections">("nearby");
  const opacity = useRef(new Animated.Value(1)).current;

  const nearbyPeople = people.filter(user => user.distance !== undefined && user.distance <= 0.5);
  const heatzonePeople = people.filter(user => user.distance !== undefined && user.distance > 0.5);

  const handleTabSwitch = (tab: "nearby" | "heatzones" | "connections") => {
    Animated.sequence([
      Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
    ]).start();
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "nearby" && styles.activeNearbyTab]}
          onPress={() => handleTabSwitch("nearby")}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={activeTab === "nearby" ? "#202020" : "#fff"}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === "nearby" && styles.activeNearbyTabText]}>People</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === "heatzones" && styles.activeHeatzoneTab]}
          onPress={() => handleTabSwitch("heatzones")}
        >
          <Ionicons
            name="flame-outline"
            size={18}
            color={activeTab === "heatzones" ? "#202020" : "#fff"}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === "heatzones" && styles.activeHeatzoneTabText]}>Heatzones</Text>
        </TouchableOpacity>

        {/* New Connections Tab */}
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "connections" && styles.activeConnectionsTab]}
          onPress={() => handleTabSwitch("connections")}
        >
          <Ionicons
            name="link-outline"
            size={18}
            color={activeTab === "connections" ? "#202020" : "#fff"}
            style={styles.icon}
          />
          <Text style={[styles.tabText, activeTab === "connections" && styles.activeConnectionsTabText]}>Connections</Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity }}>
        {activeTab === "nearby" ? (
          nearbyPeople.length === 0 ? (
            <Text style={styles.noPeopleText}>No nearby users found.</Text>
          ) : (
            <FlatList
              data={nearbyPeople}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.personBox} onPress={() => onUserSelect(item)}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.distance}>{(item.distance! * 1000).toFixed(0)} meters away</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        ) : activeTab === "heatzones" ? (
          heatzonePeople.length === 0 ? (
            <Text style={styles.noPeopleText}>No heatzones detected.</Text>
          ) : (
            <FlatList
              data={heatzonePeople}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.heatzoneBox} onPress={() => {}}>
                  <View style={styles.row}>
                    <View style={styles.heatzoneAvatar}>
                      <Ionicons name="location-outline" size={24} color="#fff" />
                    </View>
                    <View>
                      <Text style={styles.name}>Zone {item.id}</Text>
                      <Text style={styles.distance}>{(item.distance! * 1000).toFixed(0)} meters away</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        ) : (
          // Connections Tab
          connections.length === 0 ? (
            <Text style={styles.noPeopleText}>No connections found.</Text>
          ) : (
            <FlatList
              data={connections}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.personBox} onPress={() => onUserSelect(item)}>
                  <View style={styles.row}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.name}>{item.name}</Text>
                      {/* You can optionally display distance if available */}
                      {item.distance !== undefined && (
                        <Text style={styles.distance}>{(item.distance * 1000).toFixed(0)} meters away</Text>
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 10,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
  },
  activeNearbyTab: {
    backgroundColor: "#CCFF33",
  },
  activeHeatzoneTab: {
    backgroundColor: "#ff3333",
  },
  activeConnectionsTab: {
    backgroundColor: "#3399FF",
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
  },
  activeNearbyTabText: {
    color: "#202020",
    marginLeft: 5,
  },
  activeHeatzoneTabText: {
    color: "#202020",
    marginLeft: 5,
  },
  activeConnectionsTabText: {
    color: "#202020",
    marginLeft: 5,
  },
  icon: {
    marginRight: 6,
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
  heatzoneBox: {
    backgroundColor: "#400000",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  heatzoneAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ff3333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
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
    textAlign: "center",
    marginTop: 20,
  },
});
