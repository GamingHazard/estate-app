import AsyncStorage from "@react-native-async-storage/async-storage";

export type AdminNotificationType =
  | "review"
  | "maintenance"
  | "system"
  | "message";

export type AdminNotificationSeverity = "info" | "warning" | "critical";

export type AdminNotification = {
  id: string;
  title: string;
  message: string;
  type: AdminNotificationType;
  severity: AdminNotificationSeverity;
  read: boolean;
  createdAt: string;
  relatedPropertyId?: string;
  actionLabel?: string;
};

const STORAGE_KEY = "admin-notifications";
const listeners = new Set<() => void>();

const seedNotifications: AdminNotification[] = [
  {
    id: "notification-property-review",
    title: "New Property Request",
    message: "A new property has been submitted for review.",
    type: "review",
    severity: "warning",
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relatedPropertyId: "property-1",
    actionLabel: "Review property",
  },
  {
    id: "notification-maintenance",
    title: "Maintenance Review Required",
    message: "Two properties have maintenance items awaiting attention.",
    type: "maintenance",
    severity: "warning",
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    actionLabel: "Review maintenance",
  },
  {
    id: "notification-inquiry",
    title: "New Property Inquiries",
    message: "Five new inquiries were received in the last 24 hours.",
    type: "message",
    severity: "info",
    read: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    actionLabel: "Open messages",
  },
  {
    id: "notification-system-update",
    title: "System Update",
    message: "New features have been added to the admin dashboard.",
    type: "system",
    severity: "info",
    read: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

let notifications = seedNotifications;
let hasLocalMutation = false;
let hydrationPromise: Promise<void>;

const notify = () => listeners.forEach((listener) => listener());

const persist = async () => {
  await hydrationPromise;
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
};

const hydrate = async () => {
  try {
    const storedNotifications = await AsyncStorage.getItem(STORAGE_KEY);

    if (storedNotifications && !hasLocalMutation) {
      const parsed: unknown = JSON.parse(storedNotifications);

      if (Array.isArray(parsed)) {
        notifications = parsed as AdminNotification[];
        notify();
      }
    }
  } catch (error) {
    console.error("Unable to restore admin notifications:", error);
  }
};

hydrationPromise = hydrate();

export const adminNotificationStore = {
  getSnapshot: () => notifications,
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getById: (id: string) =>
    notifications.find((notification) => notification.id === id),
  markAsRead: (id: string) => {
    notifications = notifications.map((notification) =>
      notification.id === id ? { ...notification, read: true } : notification,
    );
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save notification read state:", error),
    );
  },
  markAllAsRead: () => {
    notifications = notifications.map((notification) => ({
      ...notification,
      read: true,
    }));
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to save notification read states:", error),
    );
  },
  remove: (id: string) => {
    notifications = notifications.filter(
      (notification) => notification.id !== id,
    );
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to delete notification:", error),
    );
  },
  clearAll: () => {
    notifications = [];
    hasLocalMutation = true;
    notify();
    void persist().catch((error) =>
      console.error("Unable to clear notifications:", error),
    );
  },
};
