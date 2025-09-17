import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Tab */}
      <View
        style={{
          height: 70,
          backgroundColor: colors.card,
          paddingHorizontal: 16,
          elevation: 4,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontSize: 20,
            fontWeight: "bold",
            flex: 1,
          }}
        >
          <Ionicons
            name="home"
            size={24}
            color={colors.text}
            style={[styles.icon, { marginRight: 10 }]}
          />
          Property Consultants
        </Text>
        <TouchableOpacity
          style={[styles.themeToggle, { backgroundColor: colors.background }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === "dark" ? "moon" : "sunny"}
            size={24}
            color={colors.text}
            style={styles.icon}
          />
          <Text style={[styles.toggleText, { color: colors.text }]}>
            {theme === "dark" ? "Dark Mode" : "Light Mode"}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Main Content */}
      <View style={{ flex: 1, padding: 16, position: "relative" }}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  themeToggle: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    width: 150,
    alignSelf: "flex-end",
  },
  icon: {
    marginRight: 8,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default HomeScreen;
