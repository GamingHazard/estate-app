import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = () => {
  const { colors, theme, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.themeButton, { backgroundColor: colors.card }]}
        onPress={toggleTheme}
      >
        <Ionicons
          name={theme === "dark" ? "moon" : "sunny"}
          size={24}
          color={colors.text}
          style={styles.buttonIcon}
        />
        <Text style={[styles.buttonText, { color: colors.text }]}>
          {theme === "dark" ? "Dark Mode" : "Light Mode"}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 20,
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: "90%",
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default SettingsScreen;
