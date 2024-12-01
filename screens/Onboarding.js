import React, { useState, useRef, useContext, useCallback } from "react";
// prettier-ignore
import { View, Image, StyleSheet, Text, KeyboardAvoidingView, Platform, TextInput, Pressable } from "react-native";
import PagerView from "react-native-pager-view";
import { validateEmail, validateName } from "../utils"; // Utility functions for validating email and name inputs
import Constants from "expo-constants"; // To handle platform-specific constants like the status bar height
import { AuthContext } from "../contexts/AuthContext"; // Context to manage authentication state
import { useFonts } from "expo-font"; // To load custom fonts
import * as SplashScreen from "expo-splash-screen"; // To handle splash screen hiding

// The Onboarding component handles user input during the onboarding process
export const Onboarding = () => {
  // State for user input fields
  const [firstName, onChangeFirstName] = useState(""); // Stores the user's first name
  const [lastName, onChangeLastName] = useState(""); // Stores the user's last name
  const [email, onChangeEmail] = useState(""); // Stores the user's email

  // Validate user inputs using utility functions
  const isEmailValid = validateEmail(email);
  const isFirstNameValid = validateName(firstName);
  const isLastNameValid = validateName(lastName);

  // Reference to the PagerView component for programmatic navigation
  const viewPagerRef = useRef(PagerView);

  // Access the onboarding function from AuthContext
  const { onboard } = useContext(AuthContext);

  // Load custom fonts for the component
  const [fontsLoaded] = useFonts({
    "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
    "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
    "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
    "Karla-ExtraBold": require("../assets/fonts/Karla-ExtraBold.ttf"),
    "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
    "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
  });

  // Callback to hide the splash screen once fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Return null if fonts are not loaded to prevent rendering
  if (!fontsLoaded) {
    return null;
  }

  return (
    // KeyboardAvoidingView ensures the UI adjusts when the keyboard is open
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"} // Adjusts behavior based on platform
      onLayout={onLayoutRootView}
    >
      {/* Header with logo */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../img/littleLemonLogo.png")}
          accessible={true}
          accessibilityLabel={"Little Lemon Logo"}
        />
      </View>

      {/* Welcome message */}
      <Text style={styles.welcomeText}>Let us get to know you</Text>

      {/* PagerView for onboarding steps */}
      <PagerView
        style={styles.viewPager}
        scrollEnabled={false} // Prevent swiping between pages
        initialPage={0}
        ref={viewPagerRef}
      >
        {/* First page: First Name input */}
        <View style={styles.page} key="1">
          <View style={styles.pageContainer}>
            <Text style={styles.text}>First Name</Text>
            <TextInput
              style={styles.inputBox}
              value={firstName}
              onChangeText={onChangeFirstName}
              placeholder={"First Name"}
            />
          </View>
          {/* Page indicators */}
          <View style={styles.pageIndicator}>
            <View style={[styles.pageDot, styles.pageDotActive]}></View>
            <View style={styles.pageDot}></View>
            <View style={styles.pageDot}></View>
          </View>
          {/* Next button */}
          <Pressable
            style={[styles.btn, isFirstNameValid ? "" : styles.btnDisabled]}
            onPress={() => viewPagerRef.current.setPage(1)}
            disabled={!isFirstNameValid}
          >
            <Text style={styles.btntext}>Next</Text>
          </Pressable>
        </View>

        {/* Second page: Last Name input */}
        <View style={styles.page} key="2">
          <View style={styles.pageContainer}>
            <Text style={styles.text}>Last Name</Text>
            <TextInput
              style={styles.inputBox}
              value={lastName}
              onChangeText={onChangeLastName}
              placeholder={"Last Name"}
            />
          </View>
          <View style={styles.pageIndicator}>
            <View style={styles.pageDot}></View>
            <View style={[styles.pageDot, styles.pageDotActive]}></View>
            <View style={styles.pageDot}></View>
          </View>
          {/* Back and Next buttons */}
          <View style={styles.buttons}>
            <Pressable
              style={styles.halfBtn}
              onPress={() => viewPagerRef.current.setPage(0)}
            >
              <Text style={styles.btntext}>Back</Text>
            </Pressable>
            <Pressable
              style={[
                styles.halfBtn,
                isLastNameValid ? "" : styles.btnDisabled,
              ]}
              onPress={() => viewPagerRef.current.setPage(2)}
              disabled={!isLastNameValid}
            >
              <Text style={styles.btntext}>Next</Text>
            </Pressable>
          </View>
        </View>

        {/* Third page: Email input */}
        <View style={styles.page} key="3">
          <View style={styles.pageContainer}>
            <Text style={styles.text}>Email</Text>
            <TextInput
              style={styles.inputBox}
              value={email}
              onChangeText={onChangeEmail}
              placeholder={"Email"}
              keyboardType="email-address"
            />
          </View>
          <View style={styles.pageIndicator}>
            <View style={styles.pageDot}></View>
            <View style={styles.pageDot}></View>
            <View style={[styles.pageDot, styles.pageDotActive]}></View>
          </View>
          {/* Back and Submit buttons */}
          <View style={styles.buttons}>
            <Pressable
              style={styles.halfBtn}
              onPress={() => viewPagerRef.current.setPage(1)}
            >
              <Text style={styles.btntext}>Back</Text>
            </Pressable>
            <Pressable
              style={[styles.halfBtn, isEmailValid ? "" : styles.btnDisabled]}
              onPress={() => onboard({ firstName, lastName, email })}
              disabled={!isEmailValid}
            >
              <Text style={styles.btntext}>Submit</Text>
            </Pressable>
          </View>
        </View>
      </PagerView>
    </KeyboardAvoidingView>
  );
};

// Stylesheet for the Onboarding component
const styles = StyleSheet.create({
  // Define styles here...
});
