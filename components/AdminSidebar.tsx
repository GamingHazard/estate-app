import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { RootStackParamList } from "../types/navigation";

interface AdminSidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: any;
  isVisible?: boolean; // Add new prop
}

type AdminScreens = keyof Pick<
  RootStackParamList,
  | "PropertiesManagement"
  | "PropertyCreation"
  | "AdminNotifications"
  | "AdminMessages"
  | "Analytics"
  | "AdminSettings"
  | "AdminManual"
>;

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  screen: AdminScreens;
};

export function AdminSidebar({
  isCollapsed,
  onToggleCollapse,
  isVisible = true,
}: AdminSidebarProps) {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const sidebarWidth = isCollapsed ? 0 : 250; // Changed from 60 to 0

  const menuItems: MenuItem[] = [
    {
      icon: "grid-outline",
      label: "Dashboard",
      screen: "PropertiesManagement",
    },
    {
      icon: "add-circle-outline",
      label: "Create Property",
      screen: "PropertyCreation",
    },
    {
      icon: "notifications-outline",
      label: "Notifications",
      screen: "AdminNotifications",
    },
    {
      icon: "mail-outline",
      label: "Messages",
      screen: "AdminMessages",
    },
    {
      icon: "analytics-outline",
      label: "Analytics",
      screen: "Analytics",
    },
    {
      icon: "settings-outline",
      label: "Settings",
      screen: "AdminSettings",
    },
    {
      icon: "information-circle-outline",
      label: "Manual",
      screen: "AdminManual",
    },
  ];

  const styles = StyleSheet.create({
    container: {
      width: sidebarWidth,
      backgroundColor: colors.card,
      borderRightWidth: 1,
      borderRightColor: colors.border,
      height: "100%",
      position: "absolute",
      zIndex: 1000,
      shadowColor: "#000",
      display: isCollapsed ? "none" : "flex", // Add display property
    },
    header: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      opacity: isCollapsed ? 0 : 1,
    },
    menuItem: {
      flexDirection: "row",
      alignItems: "center",
      height: 50,
      paddingHorizontal: 16,
    },
    activeMenuItem: {
      backgroundColor: colors.primary + "20",
    },
    menuIcon: {
      width: 28,
      alignItems: "center",
    },
    menuLabel: {
      marginLeft: 12,
      fontSize: 16,
      color: colors.text,
      opacity: isCollapsed ? 0 : 1,
    },
    collapseButton: {
      borderRadius: 8,
      backgroundColor: colors.background,
    },
    badge: {
      backgroundColor: "#f59e0b",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 4,
      flexDirection: "row",
      alignItems: "center",
    },
    badgeText: {
      color: "white",
      fontSize: 12,
      marginLeft: 4,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {!isCollapsed && (
          <View style={styles.badge}>
            <MaterialIcons name="security" size={12} color="white" />
            <Text style={styles.badgeText}>Admin</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.collapseButton}
          onPress={onToggleCollapse}
        >
          <MaterialIcons
            name={isCollapsed ? "chevron-right" : "chevron-left"}
            size={24}
            color={colors.text}
          />
        </TouchableOpacity>
      </View>
      {menuItems.map((item, index) => (
        <TouchableOpacity
          key={index}
          style={[styles.menuItem]}
          onPress={() => {
            navigation.navigate(item.screen), onToggleCollapse();
          }} // Auto expand on navigation if collapsed
        >
          <View style={styles.menuIcon}>
            <Ionicons name={item.icon} size={24} color={colors.text} />
          </View>
          {!isCollapsed && <Text style={styles.menuLabel}>{item.label}</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );
}
