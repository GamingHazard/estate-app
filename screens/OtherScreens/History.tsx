import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface HistoryProps {
  // Add props here if needed
}

const History: React.FC<HistoryProps> = () => {
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

export default History;
