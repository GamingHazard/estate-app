import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Import your screen components here
import HomeScreen from "../screens/HomeScreen";
import DealsScreen from "../screens/DealsScreen";
import SavedScreen from "../screens/SavedScreen";
import MessagesScreen from "../screens/MessagesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import AccountScreen from "../screens/AccountScreens/Account";
import GeneralSettings from "../screens/SettingsScreens/ApplicationSettings";
import UserManual from "../screens/OtherScreens/UserManual";
import TermsAndConditions from "../screens/SettingsScreens/Terms&Conditions";
import History from "../screens/OtherScreens/History";
import CustomerCare from "../screens/OtherScreens/CustomerCare";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Deals":
              iconName = focused ? "pricetag" : "pricetag-outline";
              break;
            case "Saved":
              iconName = focused ? "bookmark" : "bookmark-outline";
              break;
            case "Messages":
              iconName = focused ? "chatbox" : "chatbox-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
            default:
              iconName = "alert-circle";
          }

          return <Ionicons name={iconName} size={30} color={color} />;
        },
        // tabBarShowLabel: false,
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
          marginVertical: 5,
          marginHorizontal: 10,
          borderRadius: 15,
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 10,
          zIndex: 10,
          backgroundColor: colors.card,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
      />
      <Tab.Screen name="Deals" component={DealsScreen} />
      <Tab.Screen name="Saved" component={SavedScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
};

const Navigation = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="General settings" component={GeneralSettings} />
      <Stack.Screen name="User Guide" component={UserManual} />
      <Stack.Screen
        name="Terms-and-Conditions"
        component={TermsAndConditions}
      />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Customer Care" component={CustomerCare} />
    </Stack.Navigator>
  );
};

export default Navigation;
