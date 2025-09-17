import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface UserManualProps {
  // Add props here if needed
}

const UserManual: React.FC<UserManualProps> = () => {
  return (
    <View style={styles.container}>
      <Text>User Guide Screen</Text>
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

export default UserManual;
