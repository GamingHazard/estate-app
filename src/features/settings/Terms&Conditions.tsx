import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TermsAndConditionsProps {
  // Add props here if needed
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = () => {
  return (
    <View style={styles.container}>
      <Text>Terms and Conditions Screen</Text>
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

export default TermsAndConditions;
