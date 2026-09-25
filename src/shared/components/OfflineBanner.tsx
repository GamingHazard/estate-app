import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeContext";

export default function OfflineBanner() {
  const { colors } = useTheme();

  return (
    <View
      style={[styles.container, { backgroundColor: colors.warning }]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <Ionicons name="cloud-offline-outline" size={16} color="white" />
      <Text style={styles.text}>
        You are offline. Showing saved data where available.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
});
