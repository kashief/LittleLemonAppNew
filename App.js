// Date: November 30, 2024
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useEffect, useMemo, useReducer } from "react";
import { Alert } from "react-native";
import { Onboarding } from "./screens/Onboarding";
import { Profile } from "./screens/Profile";
import SplashScreen from "./screens/SplashScreen";
import { Home } from "./screens/Home";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { AuthContext } from "./contexts/AuthContext";

// Create the stack navigator
const Stack = createNativeStackNavigator();

export default function App() {
  // Reducer function to manage app state
  const [state, dispatch] = useReducer(
    (prevState, action) => {
      switch (action.type) {
        case "onboard":
          return {
            ...prevState,
            isLoading: false,
            isOnboardingCompleted: action.isOnboardingCompleted,
          };
        default:
          return prevState;
      }
    },
    {
      isLoading: true,
      isOnboardingCompleted: false,
    }
  );

  // Check onboarding completion status from AsyncStorage
  useEffect(() => {
    (async () => {
      let profileData = null; // Adjusted initialization
      try {
        const getProfile = await AsyncStorage.getItem("profile");
        if (getProfile !== null) {
          profileData = JSON.parse(getProfile); // Parse stored data correctly
        }
      } catch (error) {
        console.error("Error reading profile data:", error);
      } finally {
        const isOnboarded = profileData && Object.keys(profileData).length !== 0;
        dispatch({ type: "onboard", isOnboardingCompleted: isOnboarded });
      }
    })();
  }, []);

  // Memoized auth context for managing authentication-related actions
  const authContext = useMemo(
    () => ({
      onboard: async (data) => {
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem("profile", jsonValue);
        } catch (error) {
          console.error("Error saving profile data:", error);
        }
        dispatch({ type: "onboard", isOnboardingCompleted: true });
      },
      update: async (data) => {
        try {
          const jsonValue = JSON.stringify(data);
          await AsyncStorage.setItem("profile", jsonValue);
        } catch (error) {
          console.error("Error updating profile data:", error);
        }
        Alert.alert("Success", "Successfully saved changes!");
      },
      logout: async () => {
        try {
          await AsyncStorage.clear();
        } catch (error) {
          console.error("Error clearing AsyncStorage:", error);
        }
        dispatch({ type: "onboard", isOnboardingCompleted: false });
      },
    }),
    []
  );

  // Display splash screen while loading
  if (state.isLoading) {
    return <SplashScreen />;
  }

  // Main app rendering with navigation and context
  return (
    <AuthContext.Provider value={authContext}>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator>
          {state.isOnboardingCompleted ? (
            // User is onboarded; show home and profile screens
            <>
              <Stack.Screen
                name="Home"
                component={Home}
                options={{ headerShown: false }}
              />
              <Stack.Screen name="Profile" component={Profile} />
            </>
          ) : (
            // User is not onboarded; show onboarding screen
            <Stack.Screen
              name="Onboarding"
              component={Onboarding}
              options={{ headerShown: false }}
            />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
