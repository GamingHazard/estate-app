import React from "react";
import {
  Alert,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useAdminNotifications } from "../../../shared/hooks/useAdminNotifications";

export function AdminNotifications() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    remove,
    clearAll,
  } = useAdminNotifications();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    heading: { color: colors.text, fontSize: 22, fontWeight: "700" },
    unread: { color: colors.textMuted, fontSize: 13, marginTop: 4 },
    headerActions: { flexDirection: "row", gap: 8 },
    headerButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 7,
      borderWidth: 1,
      borderColor: colors.border,
    },
    headerButtonText: {
      color: colors.primary,
      fontSize: 12,
      fontWeight: "700",
    },
    clearButton: { borderColor: colors.destructive },
    clearButtonText: { color: colors.destructive },
    notificationItem: {
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unreadNotification: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    title: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    timestamp: {
      fontSize: 12,
      color: colors.textMuted,
    },
    deleteButton: { padding: 4, marginLeft: 10 },
    empty: { alignItems: "center", padding: 32 },
    emptyTitle: { color: colors.text, fontSize: 17, fontWeight: "700" },
    emptyText: { color: colors.textMuted, marginTop: 6, textAlign: "center" },
  });

  const confirmClearAll = () => {
    Alert.alert("Clear notifications", "Delete all admin notifications?", [
      { text: "Cancel", style: "cancel" },
      { text: "Clear all", style: "destructive", onPress: clearAll },
    ]);
  };

  const confirmRemove = (id: string) => {
    Alert.alert("Delete notification", "Delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => remove(id),
      },
    ]);
  };

  const renderNotification = ({
    item,
  }: {
    item: (typeof notifications)[number];
  }) => (
    <TouchableOpacity
      style={[styles.notificationItem, !item.read && styles.unreadNotification]}
      onPress={() => {
        markAsRead(item.id);
        navigation.navigate("AdminNotificationDetails", {
          notificationId: item.id,
        });
      }}
    >
      <View style={styles.footer}>
        <Text style={styles.title}>{item.title}</Text>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(event) => {
            event.stopPropagation();
            confirmRemove(item.id);
          }}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${item.title}`}
        >
          <MaterialIcons
            name="delete-outline"
            size={20}
            color={colors.destructive}
          />
        </TouchableOpacity>
      </View>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.footer}>
        <Text style={styles.timestamp}>
          {new Date(item.createdAt).toLocaleString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.heading}>Notifications</Text>
          <Text style={styles.unread}>{unreadCount} unread</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <Text style={styles.headerButtonText}>Mark all read</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.headerButton, styles.clearButton]}
            onPress={confirmClearAll}
            disabled={notifications.length === 0}
          >
            <Text style={[styles.headerButtonText, styles.clearButtonText]}>
              Clear all
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <FlatList
        data={notifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <MaterialIcons
              name="notifications-none"
              size={42}
              color={colors.textMuted}
            />
            <Text style={styles.emptyTitle}>No notifications</Text>
            <Text style={styles.emptyText}>You are all caught up.</Text>
          </View>
        }
      />
    </View>
  );
}
