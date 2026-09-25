import React, { useEffect } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useAdminNotifications } from "../../../shared/hooks/useAdminNotifications";

export function AdminNotificationDetails() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { getById, markAsRead, remove } = useAdminNotifications();
  const notification = getById(route.params?.notificationId);

  useEffect(() => {
    if (notification && !notification.read) {
      markAsRead(notification.id);
    }
  }, [notification, markAsRead]);

  const styles = StyleSheet.create({
    container: { flex: 1, padding: 16, backgroundColor: colors.background },
    card: {
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 16,
    },
    icon: {
      width: 44,
      height: 44,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary + "20",
    },
    title: { color: colors.text, fontSize: 22, fontWeight: "700", flex: 1 },
    label: {
      color: colors.textMuted,
      fontSize: 12,
      fontWeight: "700",
      textTransform: "uppercase",
      marginBottom: 6,
    },
    message: { color: colors.text, fontSize: 16, lineHeight: 24 },
    meta: { color: colors.textMuted, fontSize: 14, marginTop: 8 },
    action: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      padding: 13,
      alignItems: "center",
      marginTop: 12,
    },
    deleteAction: {
      borderWidth: 1,
      borderColor: colors.destructive,
      borderRadius: 8,
      padding: 13,
      alignItems: "center",
      marginTop: 12,
    },
    actionText: { color: "white", fontWeight: "700" },
    deleteText: { color: colors.destructive, fontWeight: "700" },
  });

  if (!notification) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Notification unavailable</Text>
          <Text style={styles.meta}>
            This notification may have been deleted or is no longer available.
          </Text>
        </View>
      </View>
    );
  }

  const iconName =
    notification.type === "review"
      ? "rate-review"
      : notification.type === "maintenance"
        ? "build"
        : notification.type === "message"
          ? "mail"
          : "info-outline";

  const deleteNotification = () => {
    Alert.alert("Delete notification", "Delete this notification?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          remove(notification.id);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <View style={styles.header}>
          <View style={styles.icon}>
            <MaterialIcons name={iconName} size={24} color={colors.primary} />
          </View>
          <Text style={styles.title}>{notification.title}</Text>
        </View>
        <Text style={styles.label}>Notification</Text>
        <Text style={styles.message}>{notification.message}</Text>
        <Text style={styles.meta}>
          {new Date(notification.createdAt).toLocaleString()}
        </Text>
        <Text style={styles.meta}>
          Type: {notification.type} | Severity: {notification.severity}
        </Text>
        {notification.relatedPropertyId && (
          <Pressable
            style={styles.action}
            onPress={() =>
              navigation.navigate("AdminPropertyDetails", {
                propertyId: notification.relatedPropertyId,
              })
            }
          >
            <Text style={styles.actionText}>
              {notification.actionLabel || "Open related property"}
            </Text>
          </Pressable>
        )}
        <Pressable style={styles.deleteAction} onPress={deleteNotification}>
          <Text style={styles.deleteText}>Delete notification</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}
