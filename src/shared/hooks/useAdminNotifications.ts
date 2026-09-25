import { useSyncExternalStore } from "react";
import { adminNotificationStore } from "../../data/adminNotificationStore";

export function useAdminNotifications() {
  const notifications = useSyncExternalStore(
    adminNotificationStore.subscribe,
    adminNotificationStore.getSnapshot,
    adminNotificationStore.getSnapshot,
  );

  return {
    notifications,
    unreadCount: notifications.filter((notification) => !notification.read)
      .length,
    getUnread: () => notifications.filter((notification) => !notification.read),
    getById: adminNotificationStore.getById,
    markAsRead: adminNotificationStore.markAsRead,
    markAllAsRead: adminNotificationStore.markAllAsRead,
    remove: adminNotificationStore.remove,
    clearAll: adminNotificationStore.clearAll,
  };
}
