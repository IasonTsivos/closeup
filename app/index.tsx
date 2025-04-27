import React, { useState, useEffect } from "react";
import { Text, StyleSheet, Pressable, TextInput, View, Image } from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore"; 
import { getUserId } from "./utils/userId"; 

export default function Index() {
  const router = useRouter();
  const [instagramHandle, setInstagramHandle] = useState<string>('');
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isLocked, setIsLocked] = useState<boolean>(false); // 💡 New: Lock input if handle already exists

  // 🔁 On mount: load existing handle from Firestore
  useEffect(() => {
    const fetchHandle = async () => {
      const userId = await getUserId();
      const docRef = doc(db, "users", userId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data?.name) {
          setInstagramHandle(data.name);
          setIsLocked(true); // Disable editing
        }
      }
    };
    fetchHandle();
  }, []);

  // Save handle to Firestore
  const handleInstagramHandle = async () => {
    if (instagramHandle.trim() !== '') {
      try {
        const userId = await getUserId();
        await setDoc(doc(db, "users", userId), {
          name: instagramHandle,
        });
        setIsLocked(true); // Lock the input after saving
        router.push("/map");
      } catch (error) {
        console.error("Error saving Instagram handle:", error);
      }
    }
  };

  // Enable button if there's valid input
  const handleChange = (text: string) => {
    setInstagramHandle(text);
    setIsValid(text.trim() !== '');
  };

  return (
    <LinearGradient 
      colors={['#303030', '#888']} 
      locations={[0.1, 1]} 
      style={styles.container} 
      start={[0, 0]} 
      end={[1, 1]}
    >
      <Text style={styles.title}>👋 Welcome to CloseUp</Text>
      <Text style={styles.subtitle}>Start exploring nearby people on the map.</Text>

      <View style={styles.inputContainer}>
        <Image 
          source={require("../assets/instagram.png")} 
          style={styles.instagramLogo}
        />
        <Text style={styles.atSymbol}>@</Text>
        <TextInput
          style={[styles.input, isLocked && { color: "#999" }]}
          value={instagramHandle}
          onChangeText={handleChange}
          placeholder="Enter your Instagram handle"
          placeholderTextColor="#bbb"
          autoCapitalize="none"
          autoCorrect={false}
          editable={!isLocked} // 👈 Disable if locked
        />
      </View>

      {!isLocked && (
        <Pressable 
          style={[styles.button, !isValid && styles.disabledButton]} 
          onPress={handleInstagramHandle} 
          disabled={!isValid}
        >
          <Text style={styles.buttonText}>Open Map</Text>
        </Pressable>
      )}

      {isLocked && (
        <Pressable 
          style={styles.button}
          onPress={() => router.push("/map")}
        >
          <Text style={styles.buttonText}>View Map</Text>
        </Pressable>
      )}
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
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 10,
    marginBottom: 24,
    width: "80%",
    height: 50,
  },
  instagramLogo: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  atSymbol: {
    fontSize: 18,
    color: "#bbb",
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
  button: {
    backgroundColor: "#CCFF33",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: "#aaa",
  },
  buttonText: {
    color: "#303030",
    fontSize: 16,
    fontWeight: "500",
  },
});
