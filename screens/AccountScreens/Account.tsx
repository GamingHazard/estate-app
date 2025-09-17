import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface AccountScreenProps {
  // Add props here if needed
}

const AccountScreen: React.FC<AccountScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Account Screen</Text>
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

export default AccountScreen;
