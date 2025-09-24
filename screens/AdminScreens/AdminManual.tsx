import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export function AdminManual() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginTop: 16,
      marginBottom: 8,
    },
    text: {
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
      marginBottom: 12,
    },
    bulletPoint: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 8,
      paddingLeft: 16,
    },
    bullet: {
      color: colors.text,
      marginRight: 8,
    },
    bulletText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
  });

  return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Welcome to the Admin Dashboard</Text>
          <Text style={styles.text}>
            This manual provides comprehensive guidance on using the admin dashboard effectively.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Getting Started</Text>
          <Text style={styles.text}>
            The admin dashboard gives you complete control over property listings, user management,
            and system settings.
          </Text>
          
          <Text style={styles.subsectionTitle}>Navigation</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Use the sidebar menu to access different sections of the dashboard
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Click the collapse button to minimize the sidebar
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Management</Text>
          <Text style={styles.subsectionTitle}>Adding Properties</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Navigate to Property Creation to add new listings
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Fill in all required fields and upload high-quality images
            </Text>
          </View>
          
          <Text style={styles.subsectionTitle}>Managing Listings</Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Review, edit, or remove property listings from the Properties Management section
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analytics</Text>
          <Text style={styles.text}>
            Monitor key metrics and performance indicators through the Analytics dashboard:
          </Text>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              Track property views, inquiries, and conversions
            </Text>
          </View>
          <View style={styles.bulletPoint}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.bulletText}>
              View revenue statistics and trends
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need Help?</Text>
          <Text style={styles.text}>
            Contact our support team for technical assistance or questions about the admin dashboard.
          </Text>
        </View>
      </ScrollView>
  );
}