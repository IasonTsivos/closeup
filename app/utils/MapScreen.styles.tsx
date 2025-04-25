// MapScreen.styles.ts
import { StyleSheet, Dimensions } from "react-native";

const { height } = Dimensions.get("window");

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  mapContainer: {
    height: height * 0.6,
    position: "relative",
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 15,
    backgroundColor: "#CCFF33",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  backButton2: {
    position: "absolute",
    top: 10,
    left: 15,
    backgroundColor: "#CCFF33",
    padding: 10,
    borderRadius: 20,
    zIndex: 10,
  },
  appTitle: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 25,
    fontWeight: "bold",
    color: "#CCFF33",
    zIndex: 10,
    textShadowColor: "#000",
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 3,
  },
  bottomContent: {
    flex: 1,
    padding: 10,
    backgroundColor: "#101010",
  },
  selectedUserDetails: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#202020",
    padding: 20,
    borderRadius: 10,
  },
  userDetails: {
    alignItems: "center",
  },
  userName: {
    color: "#CCFF33",
    fontSize: 24,
    fontWeight: "bold",
  },
  userInterestsTitle: {
    color: "#fff",
    fontSize: 18,
    marginTop: 15,
    fontWeight: "bold",
  },
  userInterests: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    justifyContent: "center",
  },
  interestPill: {
    backgroundColor: "#303030",
    borderRadius: 15,
    padding: 8,
    margin: 5,
  },
  interestText: {
    color: "#CCFF33",
  },
  viewsCounter: {
    position: "absolute",
    top: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#202020",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    zIndex: 10,
  },
  viewsText: {
    color: "#CCFF33",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 14,
  },
});
