import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../../shared/types/navigation";

type NavigationProp = StackNavigationProp<RootStackParamList>;

export function Dashboard() {
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const stats = [
    {
      label: "Total properties",
      value: "128",
      delta: "+12%",
      icon: "home" as const,
      tint: colors.primary,
    },
    {
      label: "Occupancy",
      value: "91%",
      delta: "+4%",
      icon: "business" as const,
      tint: "#10b981",
    },
    {
      label: "Pending review",
      value: "14",
      delta: "-3",
      icon: "timer" as const,
      tint: colors.warning,
    },
    {
      label: "Revenue",
      value: "$42.8k",
      delta: "+8.2%",
      icon: "trending-up" as const,
      tint: "#8b5cf6",
    },
  ];

  const alerts = [
    "3 lease renewals due this week",
    "2 properties need maintenance review",
    "5 new inquiries from the last 24 hours",
  ];

  const quickActions = [
    { label: "Messages", route: "AdminMessages", icon: "mail" },

    {
      label: "Notifications",
      route: "AdminNotifications",
      icon: "notifications",
    },
    {
      label: "Manual",
      route: "AdminManual",
      icon: "help-circle",
    },
    { label: "Add property", route: "PropertyCreation", icon: "add-circle" },
    { label: "Analytics", route: "Analytics", icon: "bar-chart" },
    { label: "Settings", route: "AdminSettings", icon: "settings" },
  ] as const;

  const propertyHealth = [
    { name: "Sunset Villa", status: "Healthy", value: "96%" },
    { name: "Oak Heights", status: "Attention", value: "74%" },
    { name: "River Point", status: "Healthy", value: "92%" },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: colors.background,
    },
    header: {
      marginBottom: 20,
    },
    title: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: colors.textMuted,
    },
    statsGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
      rowGap: 12,
      columnGap: 12,
    },
    statCard: {
      width: "48%",
      backgroundColor: colors.card,
      borderRadius: 14,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border,
      minHeight: 120,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    statHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 12,
    },
    statLabel: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    statValue: {
      fontSize: 26,
      fontWeight: "700",
      color: colors.text,
      marginTop: 8,
    },
    statDelta: {
      marginTop: 8,
      fontSize: 12,
      color: "#10b981",
      fontWeight: "600",
    },
    section: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: colors.text,
      marginBottom: 12,
    },
    alertList: {
      gap: 10,
    },
    alertItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderRadius: 8,
      padding: 10,
      borderWidth: 1,
      borderColor: colors.border,
    },
    alertText: {
      marginLeft: 10,
      flex: 1,
      fontSize: 13,
      color: colors.text,
    },
    quickActions: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 5,
    },
    quickAction: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      paddingVertical: 10,
    },
    quickActionText: {
      marginLeft: 8,
      color: colors.text,
      fontWeight: "600",
      fontSize: 13,
    },
    healthRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    healthName: {
      color: colors.text,
      fontSize: 14,
      fontWeight: "600",
    },
    healthMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    healthBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: "rgba(16,185,129,0.15)",
    },
    healthBadgeText: {
      fontSize: 11,
      color: "#10b981",
      fontWeight: "700",
    },
    healthValue: {
      fontSize: 13,
      color: colors.textMuted,
      fontWeight: "600",
    },
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your property portfolio</Text>
      </View>
      <View style={styles.statsGrid}>
        {stats.map((item) => (
          <View key={item.label} style={styles.statCard}>
            <View style={styles.statHeader}>
              <Text style={styles.statLabel}>{item.label}</Text>
              <MaterialIcons name={item.icon} size={18} color={item.tint} />
            </View>
            <Text style={styles.statValue}>{item.value}</Text>
            <Text style={styles.statDelta}>{item.delta} vs last month</Text>
          </View>
        ))}
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.quickActions}>
          {quickActions.map((action) => (
            <Pressable
              key={action.label}
              style={styles.quickAction}
              onPress={() => navigation.navigate(action.route)}
            >
              <Ionicons
                name={action.icon as any}
                size={18}
                color={colors.primary}
              />
              <Text style={styles.quickActionText}>{action.label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Action center</Text>
        <View style={styles.alertList}>
          {alerts.map((alert) => (
            <View key={alert} style={styles.alertItem}>
              <Ionicons name="alert-circle" size={18} color={colors.warning} />
              <Text style={styles.alertText}>{alert}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Property health</Text>
        {propertyHealth.map((property) => (
          <View key={property.name} style={styles.healthRow}>
            <Text style={styles.healthName}>{property.name}</Text>
            <View style={styles.healthMeta}>
              <View style={styles.healthBadge}>
                <Text style={styles.healthBadgeText}>{property.status}</Text>
              </View>
              <Text style={styles.healthValue}>{property.value}</Text>
            </View>
          </View>
        ))}
      </View>
      <View style={{ height: 70, width: "100%" }} />
    </ScrollView>
  );
}
