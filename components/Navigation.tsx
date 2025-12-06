import React, { useState } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { AdminLayout } from "../screens/AdminScreens/AdminLayout";

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
import PropertyDetailsScreen from "../screens/PropertyDetailsScreen";
import { PropertiesManagement } from "../screens/AdminScreens/PropertiesManagement";
import { PropertyDetails } from "../screens/AdminScreens/PropertyDetails";
import { PropertyCreation } from "../screens/AdminScreens/PropertyCreation";
import { AdminNotifications } from "../screens/AdminScreens/AdminNotifications";
import { AdminMessages } from "../screens/AdminScreens/AdminMessages";
import { AdminSettings } from "../screens/AdminScreens/AdminSettings";
import { Analytics } from "../screens/AdminScreens/Analytics";
import { AdminManual } from "../screens/AdminScreens/AdminManual";

import { RootStackParamList } from "../types";
import { useInternetConnection } from "../hooks/useInternetConnection";
import NoInternetScreen from "../screens/NoInternetScreen";
import AgentProfileScreen from "../screens/AgentProfileScreen";

import PaymentMethodScreen from "../screens/PaymentMethodScreen";
import AddCardScreen from "../screens/AddCardScreen";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TabNavigator = () => {
  const { colors } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: IconName;
          let iconSize = focused ? 28 : 22; // Larger when active
          let iconColor = focused ? colors.primary : colors.text;

          switch (route.name) {
            case "Home":
              iconName = focused ? "home" : "home-outline";
              break;
            case "Deals":
              iconName = focused ? "pricetags" : "pricetags-outline";
              break;
            case "Saved":
              iconName = focused ? "bookmark" : "bookmark-outline";
              break;
            case "Messages":
              iconName = focused
                ? "chatbox-ellipses"
                : "chatbox-ellipses-outline";
              break;
            case "Settings":
              iconName = focused ? "settings" : "settings-outline";
              break;
            case "Admin":
              iconName = focused ? "grid" : "grid-outline";
              iconSize = focused ? 26 : 20;
              iconColor = focused ? colors.primary : colors.text;
              break;
            default:
              iconName = "alert-circle";
          }

          return <Ionicons name={iconName} size={iconSize} color={iconColor} />;
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive + "99",
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.card,
          borderWidth: 1,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 8,
          paddingHorizontal: 12,
          paddingVertical: 0,
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
      <Tab.Screen
        name="Admin"
        component={AdminNavigator}
        options={{
          unmountOnBlur: true, // Reset state when navigating away
        }}
      />
    </Tab.Navigator>
  );
};

const AdminStack = createStackNavigator();

const AdminNavigator = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AdminLayout
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    >
      <AdminStack.Navigator
        initialRouteName="PropertiesManagement"
        screenOptions={{
          headerShown: false,
        }}
      >
        <AdminStack.Screen
          name="PropertiesManagement"
          component={PropertiesManagement}
        />
        <AdminStack.Screen
          name="PropertyCreation"
          component={PropertyCreation}
        />
        <AdminStack.Screen
          name="AdminNotifications"
          component={AdminNotifications}
        />
        <AdminStack.Screen name="AdminMessages" component={AdminMessages} />
        <AdminStack.Screen name="AdminSettings" component={AdminSettings} />
        <AdminStack.Screen name="Analytics" component={Analytics} />
        <AdminStack.Screen name="AdminManual" component={AdminManual} />
        <AdminStack.Screen
          name="AdminPropertyDetails"
          component={PropertyDetails}
        />
      </AdminStack.Navigator>
    </AdminLayout>
  );
};

const Navigation = () => {
  const { colors, theme } = useTheme();
  const isConnected = useInternetConnection();

  if (!isConnected) {
    return <NoInternetScreen />;
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.card, // background
        },
        headerTintColor: theme === "dark" ? "white" : colors.text, // text color
        headerTitleStyle: {
          fontWeight: "bold",
        },
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={TabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen name="PropertyDetails" component={PropertyDetailsScreen} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="General settings" component={GeneralSettings} />
      <Stack.Screen name="User Guide" component={UserManual} />
      <Stack.Screen
        name="Terms-and-Conditions"
        component={TermsAndConditions}
      />
      <Stack.Screen name="History" component={History} />
      <Stack.Screen name="Customer Care" component={CustomerCare} />
      <Stack.Screen name="Agent Profile" component={AgentProfileScreen} />
      <Stack.Screen name="Payment Method" component={PaymentMethodScreen} />
      <Stack.Screen name="Add Card" component={AddCardScreen} />
    </Stack.Navigator>
  );
};

export default Navigation;
