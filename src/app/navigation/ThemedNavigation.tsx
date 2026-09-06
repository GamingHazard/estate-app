import React from "react";
import { View } from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../../features/auth/AuthContext";
import AuthScreens from "../../features/auth/screens/AuthScreens";
import Navigation from "./Navigation";

const ThemedNavigation = () => {
  const { colors } = useTheme();
  const { user, isGuest } = useAuth();

  if (!user && !isGuest) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <AuthScreens />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Navigation />
    </View>
  );
};

export default ThemedNavigation;
