import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useProperties } from "../../properties/useProperties";

export function Analytics() {
  const { colors } = useTheme();
  const {
    data: properties = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useProperties();

  const categoryCounts = Object.entries(
    properties.reduce<Record<string, number>>((counts, property) => {
      const category = property.category || "Uncategorized";
      counts[category] = (counts[category] ?? 0) + 1;
      return counts;
    }, {}),
  ).sort(([left], [right]) => left.localeCompare(right));

  const metrics = [
    { label: "Properties", value: properties.length },
    {
      label: "Available units",
      value: properties.reduce(
        (total, property) => total + property.unitsAvailable,
        0,
      ),
    },
    { label: "Categories", value: categoryCounts.length },
    {
      label: "Listings with images",
      value: properties.filter((property) => property.images.length > 0).length,
    },
  ];

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
      fontWeight: "600",
      color: colors.text,
      marginBottom: 16,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
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
      fontWeight: "700",
      color: colors.text,
      marginBottom: 4,
    },
    statsLabel: {
      fontSize: 14,
      color: colors.textMuted,
    },
    categoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    categoryLabel: {
      fontSize: 14,
      color: colors.text,
      textTransform: "capitalize",
    },
    categoryValue: {
      fontSize: 14,
      color: colors.textMuted,
      fontWeight: "600",
    },
    status: {
      backgroundColor: colors.card,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
  });

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property feed</Text>
        {isLoading ? (
          <View style={styles.status}>
            <Text style={styles.statsLabel}>Loading property metrics...</Text>
          </View>
        ) : isError ? (
          <View style={styles.status}>
            <Text style={styles.statsLabel}>
              {error instanceof Error
                ? error.message
                : "Unable to load property metrics."}
            </Text>
            <TouchableOpacity onPress={() => void refetch()}>
              <Text style={{ color: colors.primary, marginTop: 10 }}>
                Try again
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            {metrics.map((metric) => (
              <View style={styles.statsCard} key={metric.label}>
                <Text style={styles.statsValue}>{metric.value}</Text>
                <Text style={styles.statsLabel}>{metric.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      {!isLoading && !isError && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Properties by category</Text>
          {categoryCounts.length > 0 ? (
            categoryCounts.map(([category, count]) => (
              <View style={styles.categoryRow} key={category}>
                <Text style={styles.categoryLabel}>{category}</Text>
                <Text style={styles.categoryValue}>{count}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.statsLabel}>No properties available.</Text>
          )}
          <Text style={[styles.statsLabel, { marginTop: 16 }]}>
            Sales, occupancy, and revenue metrics are not provided by the
            property feed.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}
