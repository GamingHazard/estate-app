import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface GeneralSettingsProps {
  // Add props here if needed
}

const GeneralSettings: React.FC<GeneralSettingsProps> = () => {
  return (
    <View style={styles.container}>
      <Text>General settings Screen</Text>
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

export default GeneralSettings;
