import React, { useState } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
  FontAwesome5,
} from "@expo/vector-icons";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../../features/auth/AuthContext";
import { AdminLayout } from "../../features/admin/screens/AdminLayout";

// Import your screen components here
import HomeScreen from "../../features/properties/HomeScreen";
import DealsScreen from "../../features/properties/DealsScreen";
import SavedScreen from "../../features/properties/SavedScreen";
import MessagesScreen from "../../features/messaging/MessagesScreen";
import SettingsScreen from "../../features/settings/SettingsScreen";
import AccountScreen from "../../features/auth/screens/Account";
import GeneralSettings from "../../features/settings/ApplicationSettings";
import UserManual from "../../features/settings/UserManual";
import TermsAndConditions from "../../features/settings/Terms&Conditions";
import History from "../../features/settings/History";
import CustomerCare from "../../features/settings/CustomerCare";
import PropertyDetailsScreen from "../../features/properties/PropertyDetailsScreen";
import { Dashboard } from "../../features/admin/screens/Dashboard";
import { PropertiesManagement } from "../../features/admin/screens/PropertiesManagement";
import { PropertyDetails } from "../../features/admin/screens/PropertyDetails";
import { PropertyCreation } from "../../features/admin/screens/PropertyCreation";
import { AdminNotifications } from "../../features/admin/screens/AdminNotifications";
import { AdminMessages } from "../../features/admin/screens/AdminMessages";
import { AdminSettings } from "../../features/admin/screens/AdminSettings";
import { Analytics } from "../../features/admin/screens/Analytics";
import { AdminManual } from "../../features/admin/screens/AdminManual";

import { RootStackParamList } from "../../shared/types";
import { useInternetConnection } from "../../shared/hooks/useInternetConnection";
import OfflineBanner from "../../shared/components/OfflineBanner";
import AgentProfileScreen from "../../features/properties/AgentProfileScreen";

import PaymentMethodScreen from "../../features/payments/PaymentMethodScreen";
import AddCardScreen from "../../features/payments/AddCardScreen";
import SellProperty from "../../features/settings/SellProperty";
import ChatRoom from "../../shared/components/ChatRoomComponent";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();

type IconName = React.ComponentProps<typeof Ionicons>["name"];

const TabNavigator = () => {
  const { colors } = useTheme();
  const { user } = useAuth();

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
        tabBarShowLabel: true,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabInactive + "99",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },
        tabBarStyle: {
          position: "absolute",
          left: 16,
          right: 16,
          bottom: 16,
          height: 60,
          borderRadius: 28,
          backgroundColor: colors.card,
          borderWidth: 0.5,
          borderColor: colors.border + "33",
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 8,
          elevation: 8,
          paddingHorizontal: 12,
          paddingVertical: 0,
          alignItems: "center",
          justifyContent: "center",
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
      {(user?.role === "landlord" || user?.role === "propertyManager") && (
        <Tab.Screen
          name="Admin"
          component={AdminNavigator}
          options={{
            unmountOnBlur: true,
          }}
        />
      )}
    </Tab.Navigator>
  );
};

const AdminStack = createStackNavigator<any>();

const AdminNavigator = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <AdminLayout
      isSidebarCollapsed={isSidebarCollapsed}
      onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
    >
      <AdminStack.Navigator
        initialRouteName="Dashboard"
        screenOptions={{
          headerShown: false,
        }}
      >
        <AdminStack.Screen name="Dashboard" component={Dashboard} />
        <AdminStack.Screen
          name="PropertiesManagement"
          component={PropertiesManagement}
        />
        <AdminStack.Screen
          name="PropertyCreation"
          component={PropertyCreation}
          options={{
            presentation: "modal",
            cardStyle: { backgroundColor: "transparent" },
            gestureEnabled: true,
          }}
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
          children={({ route }: any) => (
            <PropertyDetails propertyId={route.params?.propertyId} />
          )}
        />
      </AdminStack.Navigator>
    </AdminLayout>
  );
};

const Navigation = () => {
  const { colors, theme } = useTheme();
  const isConnected = useInternetConnection();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {!isConnected && <OfflineBanner />}
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
        <Stack.Screen
          name="PropertyDetails"
          component={PropertyDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen name="Account" component={AccountScreen} />
        <Stack.Screen name="General settings" component={GeneralSettings} />
        <Stack.Screen name="User Guide" component={UserManual} />
        <Stack.Screen name="Sell Property" component={SellProperty} />
        <Stack.Screen
          name="Terms-and-Conditions"
          component={TermsAndConditions}
        />
        <Stack.Screen name="History" component={History} />
        <Stack.Screen name="Customer Care" component={CustomerCare} />
        <Stack.Screen name="Agent Profile" component={AgentProfileScreen} />
        <Stack.Screen name="Payment Method" component={PaymentMethodScreen} />
        <Stack.Screen name="Add Card" component={AddCardScreen} />
        <Stack.Screen
          name="Chat Room"
          children={({ route }: any) => <ChatRoom {...route.params} />}
        />
      </Stack.Navigator>
    </View>
  );
};

export default Navigation;
