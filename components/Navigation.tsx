import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";

// Import your screen components here
import HomeScreen from "../screens/HomeScreen";
import DealsScreen from "../screens/DealsScreen";
import SavedScreen from "../screens/SavedScreen";
import MessagesScreen from "../screens/MessagesScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

type IconName = keyof typeof Ionicons.glyphMap;

const Navigation = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
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
              iconName = focused ? "heart" : "heart-outline";
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

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.text,

        tabBarInactiveTintColor: "gray",
        tabBarStyle: {
          paddingBottom: 5,
          paddingTop: 5,
          height: 80,
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

export default Navigation;
