import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

export function Analytics() {
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
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 16,
    },
    statsCard: {
      flex: 1,
      minWidth: 150,
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statsValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 4,
    },
    statsLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    chart: {
      height: 200,
      backgroundColor: colors.card,
      borderRadius: 8,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    chartPlaceholder: {
      color: colors.textMuted,
    },
  });

  return (
      <ScrollView style={styles.container}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>1,234</Text>
              <Text style={styles.statsLabel}>Total Properties</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>56</Text>
              <Text style={styles.statsLabel}>New Listings</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>89</Text>
              <Text style={styles.statsLabel}>Active Agents</Text>
            </View>
            <View style={styles.statsCard}>
              <Text style={styles.statsValue}>432</Text>
              <Text style={styles.statsLabel}>Properties Sold</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Revenue</Text>
          <View style={styles.chart}>
            <Text style={styles.chartPlaceholder}>Revenue Chart Placeholder</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Activity</Text>
          <View style={styles.chart}>
            <Text style={styles.chartPlaceholder}>User Activity Chart Placeholder</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Property Categories</Text>
          <View style={styles.chart}>
            <Text style={styles.chartPlaceholder}>Categories Chart Placeholder</Text>
          </View>
        </View>
      </ScrollView>
      
  );
}