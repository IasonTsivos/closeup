import React, { useState, useRef } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Animated } from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

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
  const [activeTab, setActiveTab] = useState<"nearby" | "heatzones">("nearby");
  const opacity = useRef(new Animated.Value(1)).current;

  const nearbyPeople = people.filter(user => user.distance !== undefined && user.distance <= 0.5);

  const handleTabSwitch = (tab: "nearby" | "heatzones") => {
    Animated.sequence([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
    setActiveTab(tab);
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.leftTab,
            activeTab === "nearby" && styles.activeNearbyTab
          ]}
          onPress={() => handleTabSwitch("nearby")}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={activeTab === "nearby" ? "#202020" : "#fff"}
            style={{ marginRight: 6 }}
          />
          <Text style={[
            styles.tabText,
            activeTab === "nearby" && styles.activeNearbyTabText
          ]}>
            People
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            styles.rightTab,
            activeTab === "heatzones" && styles.activeHeatzoneTab
          ]}
          onPress={() => handleTabSwitch("heatzones")}
        >
          <Ionicons
            name="flame-outline"
            size={18}
            color={activeTab === "heatzones" ? "#202020" : "#fff"}
            style={{ marginRight: 6 }}
          />
          <Text style={[
            styles.tabText,
            activeTab === "heatzones" && styles.activeHeatzoneTabText
          ]}>
            Heatzones
          </Text>
        </TouchableOpacity>
      </View>

      {/* Animated Content */}
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
                      <Text style={styles.avatarText}>{item.id.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.name}>{item.id}</Text>
                      <Text style={styles.distance}>
                        {item.distance !== undefined
                          ? `${(item.distance * 1000).toFixed(0)} meters away`
                          : "Distance unknown"}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              )}
            />
          )
        ) : (
          <View style={styles.heatzoneContainer}>
            <Text style={styles.heatzoneText}>Heatzones will be listed here 🔥</Text>
          </View>
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
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  leftTab: {
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
  },
  rightTab: {
    borderTopRightRadius: 20,
    borderBottomRightRadius: 20,
  },
  activeNearbyTab: {
    backgroundColor: "#CCFF33",
  },
  activeHeatzoneTab: {
    backgroundColor: "#ff1f00",
  },
  tabText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  activeNearbyTabText: {
    color: "#202020",
  },
  activeHeatzoneTabText: {
    color: "#202020",
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
    textAlign: "center",
    marginTop: 20,
  },
  heatzoneContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  heatzoneText: {
    color: "#CCFF33",
    fontSize: 16,
    fontWeight: "bold",
  },
});
