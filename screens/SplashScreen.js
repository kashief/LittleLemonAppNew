import React from "react";
import { View, StyleSheet, Image } from "react-native";

// SplashScreen component displays a centered logo during app startup
const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        style={styles.logo}
        source={require("../img/littleLemonLogo.png")}
        accessible={true}
        accessibilityLabel={"Little Lemon Logo"} // Accessibility label for the logo
      />
    </View>
  );
};

const styles = StyleSheet.create({
  // Container styles for centering the content
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9", // Slightly off-white background for better visual appeal
    justifyContent: "center",
    alignItems: "center",
  },
  // Logo image styling
  logo: {
    height: 120, // Increased size slightly for better visibility
    width: "80%", // Adjusted to keep proper proportions on smaller screens
    resizeMode: "contain", // Ensures the logo fits within the given dimensions
  },
});

export default SplashScreen;
