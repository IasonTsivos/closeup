import { Text, View, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";


export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>👋 Welcome to CloseUp</Text>
      <Text style={styles.subtitle}>Start exploring nearby people on the map.</Text>

      <Pressable style={styles.button} onPress={() => router.push("/map")}>
        <Text style={styles.buttonText}>Open Map</Text>
      </Pressable>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F5F5F5",
  },
  title: {
    color: "#303030",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#303030",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#FF0000",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#303030",
    fontSize: 16,
    fontWeight: "500",
  },
});
