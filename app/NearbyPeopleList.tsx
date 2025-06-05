import React, { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Animated,
  useWindowDimensions,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

type User = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
};

type Props = {
  people: User[]; // nearby + heatzones
  connections: User[]; // connected users
  onUserSelect: (user: User) => void;
};

export default function NearbyPeopleList({ people, connections, onUserSelect }: Props) {
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const scrollRef = useRef<FlatList>(null);
  const { width } = useWindowDimensions();
  const opacity = useRef(new Animated.Value(1)).current;

  const nearbyPeople = people.filter((user) => user.distance !== undefined && user.distance <= 0.5);
  const heatzonePeople = people.filter((user) => user.distance !== undefined && user.distance > 0.5);

  const tabKeys = ["nearby", "heatzones", "connections"] as const;

  const handleTabPress = (index: number) => {
    setActiveTabIndex(index);
    scrollRef.current?.scrollToIndex({ index, animated: true });
  };

  const renderList = (type: (typeof tabKeys)[number]) => {
    if (type === "nearby") {
      return nearbyPeople.length === 0 ? (
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
      );
    }

    if (type === "heatzones") {
      return heatzonePeople.length === 0 ? (
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
      );
    }

    if (type === "connections") {
      return connections.length === 0 ? (
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
                  {item.distance !== undefined && (
                    <Text style={styles.distance}>{(item.distance * 1000).toFixed(0)} meters away</Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      );
    }

    return null;
  };

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {tabKeys.map((key, index) => {
          const isActive = index === activeTabIndex;
          let activeTabStyle = {};
          let activeTextStyle = {};
          let iconName = "";

          if (key === "nearby") {
            activeTabStyle = styles.activeNearbyTab;
            activeTextStyle = styles.activeNearbyTabText;
            iconName = "people-outline";
          } else if (key === "heatzones") {
            activeTabStyle = styles.activeHeatzoneTab;
            activeTextStyle = styles.activeHeatzoneTabText;
            iconName = "flame-outline";
          } else if (key === "connections") {
            activeTabStyle = styles.activeConnectionsTab;
            activeTextStyle = styles.activeConnectionsTabText;
            iconName = "link-outline";
          }

          return (
            <TouchableOpacity
              key={key}
              style={[styles.tabButton, isActive && activeTabStyle]}
              onPress={() => handleTabPress(index)}
            >
              <Ionicons
                name={iconName as any}
                size={18}
                color={isActive ? "#202020" : "#fff"}
                style={styles.icon}
              />
              <Text style={[styles.tabText, isActive && activeTextStyle]}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Content */}
      <Animated.View style={{ flex: 1, opacity }}>
        <FlatList
          ref={scrollRef}
          data={tabKeys}
          horizontal
          pagingEnabled
          snapToInterval={width}
          decelerationRate="fast"
          snapToAlignment="start"
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveTabIndex(index);
          }}
          renderItem={({ item }) => (
            <View style={{ width, padding: 10 }}>{renderList(item)}</View>
          )}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  activeNearbyTab: { backgroundColor: "#CCFF33" },
  activeHeatzoneTab: { backgroundColor: "#ff3333" },
  activeConnectionsTab: { backgroundColor: "#3399FF" },
  tabText: { color: "#fff", fontWeight: "bold" },
  activeNearbyTabText: { color: "#202020", marginLeft: 5 },
  activeHeatzoneTabText: { color: "#202020", marginLeft: 5 },
  activeConnectionsTabText: { color: "#202020", marginLeft: 5 },
  icon: { marginRight: 6 },
  row: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#CCFF33", fontWeight: "bold", fontSize: 16 },
  personBox: {
    backgroundColor: "#202020",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 20, // New
  },
  heatzoneBox: {
    backgroundColor: "#400000",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    marginRight: 20, // New
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
  name: { color: "#CCFF33", fontWeight: "bold" },
  distance: { color: "#bbb" },
  noPeopleText: {
    color: "#888",
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});
