import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AuthScreensProps {
  // Add props here if needed
}

const AuthScreens: React.FC<AuthScreensProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Auth Screens</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default AuthScreens;
