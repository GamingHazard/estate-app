import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useTheme } from "../../context/ThemeContext";
interface UserManualProps {
  // Add props here if needed
}

const UserManual: React.FC<UserManualProps> = () => {
  const { colors, theme } = useTheme();
  const navigation = useNavigation();
  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}> 
      <Text style={[styles.intro, { color: colors.text }]}>Welcome to Estate App! This guide will help you get started and make the most of your experience.</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>1. Creating an Account</Text>
        <Text style={{ color: colors.text }}>
          - Tap the Account tab and select Sign Up.
          - Enter your details and verify your email/phone number.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>2. Browsing Properties</Text>
        <Text style={{ color: colors.text }}>
          - Use the Home tab to view featured and latest properties.
          - Filter and sort listings to find your ideal property.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>3. Viewing Property Details</Text>
        <Text style={{ color: colors.text }}>
          - Tap any property to see photos, details, and amenities.
          - Contact the agent or save the property for later.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>4. Saving Properties</Text>
        <Text style={{ color: colors.text }}>
          - Tap the heart icon to save properties to your favorites.
          - Access saved properties from the Saved tab.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>5. Messaging Agents</Text>
        <Text style={{ color: colors.text }}>
          - Use the Messages tab to chat with property agents directly.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>6. Editing Your Profile</Text>
        <Text style={{ color: colors.text }}>
          - Go to Account {'>'} Edit Profile to update your information.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>7. Application Settings</Text>
        <Text style={{ color: colors.text }}>
          - Access the Settings tab to manage notifications, dark mode, and more.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>8. Getting Help</Text>
        <Text style={{ color: colors.text }}>
          - Visit Customer Care for FAQs and to report issues.
        </Text>
        <TouchableOpacity
          style={[styles.linkButton, { borderColor: colors.primary }]}
          onPress={() => navigation.navigate('CustomerCare')}
        >
          <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Go to Customer Care</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
  },
  intro: {
    fontSize: 16,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
  linkButton: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
});

export default UserManual;
