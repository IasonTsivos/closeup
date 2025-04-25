import { Text, StyleSheet, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient"; // Import LinearGradient

export default function Index() {
  const router = useRouter();

  return (
    // Use LinearGradient instead of SafeAreaView for the background
    <LinearGradient 
      colors={['#303030', '#888']} // Gradient colors
      locations={[0.1, 1]} 
      style={styles.container} 
      start={[0, 0]} 
      end={[1, 1]} // Gradient direction: top-left to bottom-right
    >
      <Text style={styles.title}>👋 Welcome to CloseUp</Text>
      <Text style={styles.subtitle}>Start exploring nearby people on the map.</Text>

      <Pressable style={styles.button} onPress={() => router.push("/map")}>
        <Text style={styles.buttonText}>Open Map</Text>
      </Pressable>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#FFFFFF",
    marginBottom: 24,
  },
  button: {
    backgroundColor: "#CCFF33",
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
