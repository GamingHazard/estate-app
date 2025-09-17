import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const HomeScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{
          height: 70,
          backgroundColor: colors.card,
          justifyContent: "center",
          paddingHorizontal: 16,
          elevation: 4,
        }}
      >
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
