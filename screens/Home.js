// Date: November 30, 2024
// Import required libraries and components
import { useEffect, useState, useCallback, useMemo } from "react";
// Prettier-ignore directives prevent auto-formatting issues in imports
// prettier-ignore
import {Text, View, StyleSheet, SectionList, Alert, Image, Pressable} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash.debounce";
// prettier-ignore
import { createTable, getMenuItems,saveMenuItems, filterByQueryAndCategories} from "../database";
import Filters from "../components/Filters";
import { getSectionListData, useUpdateEffect } from "../utils/utils";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// Base URL for fetching data
const BASE_URL =
  "https://raw.githubusercontent.com/Meta-Mobile-Developer-PC/Working-With-Data-API/main/capstone.json";

// Section categories for the menu
const sections = ["starters", "mains", "desserts"];

// Functional component to render individual menu items
const Item = ({ name, price, description, image }) => (
  <View style={styles.item}>
    <View style={styles.itemBody}>
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.description}>{description}</Text>
      <Text style={styles.price}>${price}</Text>
    </View>
    <Image
      style={styles.itemImage}
      source={{
        uri: `https://github.com/Meta-Mobile-Developer-PC/Working-With-Data-API/blob/main/images/${image}?raw=true`,
      }}
    />
  </View>
);

// Main Home component
export const Home = ({ navigation }) => {
  // Profile state stores user information
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    orderStatuses: false,
    passwordChanges: false,
    specialOffers: false,
    newsletter: false,
    image: "",
  });

  // State to store menu data, search bar text, and filters
  const [data, setData] = useState([]);
  const [searchBarText, setSearchBarText] = useState("");
  const [query, setQuery] = useState("");
  const [filterSelections, setFilterSelections] = useState(
    sections.map(() => false) // Initialize filters as unselected
  );

  // Fetch menu data from the remote server
  const fetchData = async () => {
    try {
      const response = await fetch(BASE_URL);
      const json = await response.json();
      const menu = json.menu.map((item, index) => ({
        id: index + 1,
        name: item.name,
        price: item.price.toString(), // Convert price to string for consistency
        description: item.description,
        image: item.image,
        category: item.category,
      }));
      return menu;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  // Effect to initialize the database and load profile and menu data
  useEffect(() => {
    (async () => {
      let menuItems = [];
      try {
        await createTable(); // Create the table if it doesn't exist
        menuItems = await getMenuItems(); // Retrieve items from local database

        // If the database is empty, fetch and save menu items
        if (!menuItems.length) {
          menuItems = await fetchData();
          saveMenuItems(menuItems); // Save fetched data to local database
        }

        // Convert menu items into SectionList-compatible data
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData);

        // Load user profile from AsyncStorage
        const getProfile = await AsyncStorage.getItem("profile");
        if (getProfile) {
          setProfile(JSON.parse(getProfile)); // Parse and set profile data
        }
      } catch (error) {
        Alert.alert("Error", error.message); // Show an alert for errors
      }
    })();
  }, []);

  // Effect to filter menu items when the query or filters change
  useUpdateEffect(() => {
    (async () => {
      try {
        // Determine active categories based on selected filters
        const activeCategories = sections.filter((s, i) =>
          filterSelections.every((item) => !item) ? true : filterSelections[i]
        );

        // Retrieve filtered menu items from the database
        const menuItems = await filterByQueryAndCategories(query, activeCategories);
        const sectionListData = getSectionListData(menuItems);
        setData(sectionListData); // Update data with filtered results
      } catch (error) {
        Alert.alert("Error", error.message);
      }
    })();
  }, [filterSelections, query]);

  // Debounced search function to improve performance
  const lookup = useCallback((q) => {
    setQuery(q); // Update query state
  }, []);

  const debouncedLookup = useMemo(() => debounce(lookup, 1000), [lookup]);

  // Handle search bar text change
  const handleSearchChange = (text) => {
    setSearchBarText(text);
    debouncedLookup(text); // Use debounced function to update query
  };

  // Toggle filter selection
  const handleFiltersChange = (index) => {
    const arrayCopy = [...filterSelections];
    arrayCopy[index] = !filterSelections[index]; // Toggle the filter state
    setFilterSelections(arrayCopy);
  };

  // Load custom fonts
  const [fontsLoaded] = useFonts({
    "Karla-Regular": require("../assets/fonts/Karla-Regular.ttf"),
    "Karla-Medium": require("../assets/fonts/Karla-Medium.ttf"),
    "Karla-Bold": require("../assets/fonts/Karla-Bold.ttf"),
    "Karla-ExtraBold": require("../assets/fonts/Karla-ExtraBold.ttf"),
    "MarkaziText-Regular": require("../assets/fonts/MarkaziText-Regular.ttf"),
    "MarkaziText-Medium": require("../assets/fonts/MarkaziText-Medium.ttf"),
  });

  // Hide splash screen after fonts are loaded
  const onLayoutRootView = useCallback(async () => {
    if (fontsLoaded) {
      await SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  // Render nothing until fonts are loaded
  if (!fontsLoaded) {
    return null;
  }

  return (
    <View style={styles.container} onLayout={onLayoutRootView}>
      {/* Header section with logo and profile avatar */}
      <View style={styles.header}>
        <Image
          style={styles.logo}
          source={require("../img/littleLemonLogo.png")}
          accessible
          accessibilityLabel="Little Lemon Logo"
        />
        <Pressable
          style={styles.avatar}
          onPress={() => navigation.navigate("Profile")}
        >
          {profile.image ? (
            <Image source={{ uri: profile.image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarEmpty}>
              <Text style={styles.avatarEmptyText}>
                {profile.firstName[0]}{profile.lastName[0]}{/* Initials fallback */}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Hero section with restaurant details */}
      <View style={styles.heroSection}>
        <Text style={styles.heroHeader}>Little Lemon</Text>
        <View style={styles.heroBody}>
          <View style={styles.heroContent}>
            <Text style={styles.heroHeader2}>Chicago</Text>
            <Text style={styles.heroText}>
              We are a family-owned Mediterranean restaurant, focused on traditional recipes served with a modern twist.
            </Text>
          </View>
          <Image
            style={styles.heroImage}
            source={require("../img/restauranfood.png")}
            accessible
            accessibilityLabel="Little Lemon Food"
          />
        </View>
        {/* Search bar for filtering menu items */}
        <Searchbar
          placeholder="Search"
          placeholderTextColor="#333333"
          onChangeText={handleSearchChange}
          value={searchBarText}
          style={styles.searchBar}
          iconColor="#333333"
          inputStyle={{ color: "#333333" }}
          elevation={0}
        />
      </View>

      {/* Delivery section */}
      <Text style={styles.delivery}>ORDER FOR DELIVERY!</Text>
      <Filters
        selections={filterSelections}
        onChange={handleFiltersChange}
        sections={sections}
      />

      {/* Section list to display menu items */}
      <SectionList
        style={styles.sectionList}
        sections={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <Item
            name={item.name}
            price={item.price}
            description={item.description}
            image={item.image}
          />
        )}
        renderSectionHeader={({ section: { name } }) => (
          <Text style={styles.itemHeader}>{name}</Text>
        )}
      />
    </View>
  );
};

// Styles for the component
const styles = StyleSheet.create({
  /* Add styles here */
});
