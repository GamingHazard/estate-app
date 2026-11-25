import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  AppState,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import appConfig from "../../../app.json";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import {
  SavedSearchFrequency,
} from "./generalSettingsStore";
import { useNotificationPreferences } from "./useNotificationPreferences";

type PermissionStatus = "granted" | "not-requested" | "not-allowed" | "blocked";
type PermissionState = Record<
  "camera" | "photos" | "location",
  PermissionStatus
>;

const permissionLabel: Record<PermissionStatus, string> = {
  granted: "Allowed",
  "not-requested": "Not requested",
  "not-allowed": "Not allowed",
  blocked: "Blocked in device settings",
};

const normalizePermission = (permission: {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
}): PermissionStatus => {
  if (permission.granted) return "granted";
  if (permission.status === "undetermined") return "not-requested";
  return permission.canAskAgain ? "not-allowed" : "blocked";
};

const ApplicationSettings: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isPropertyOwner =
    user?.role === "landlord" || user?.role === "propertyManager";
  const {
    preferences,
    preferencesLoading,
    preferencesLoadError,
    isSavingPreferences,
    preferencesSaveError,
    updatePreference,
    retrySync,
    reloadPreferences,
  } = useNotificationPreferences(user?.id ?? null, user?.role ?? null);
  const notificationsMasterDescription =
    "Turn on optional in-app and push notifications. Push also requires permission from your device.";
  const [permissions, setPermissions] = useState<PermissionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const loadPermissions = useCallback(async () => {
    setIsLoading(true);
    setLoadError(false);

    try {
      const [camera, photos, location] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);

      setPermissions({
        camera: normalizePermission(camera),
        photos: normalizePermission(photos),
        location: normalizePermission(location),
      });
    } catch {
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPermissions();

    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadPermissions();
    });

    return () => subscription.remove();
  }, [loadPermissions]);

  const openDeviceSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert(
        "Unable to open settings",
        "Open your device settings to manage this app's permissions.",
      );
    }
  };

  const renderPreferenceRow = (
    title: string,
    description: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    value: boolean,
    onValueChange: (nextValue: boolean) => void,
    last = false,
    disabled = false,
  ) => (
    <View
      key={title}
      style={[
        styles.permissionRow,
        !last && {
          borderBottomColor: colors.border,
          borderBottomWidth: StyleSheet.hairlineWidth,
        },
      ]}
    >
      <View
        style={[
          styles.permissionIcon,
          { backgroundColor: `${colors.primary}18` },
        ]}
      >
        <Ionicons name={icon} size={19} color={colors.primary} />
      </View>
      <View style={styles.permissionCopy}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowDescription, { color: colors.textMuted }]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={
          preferencesLoading ||
          preferencesLoadError ||
          isSavingPreferences ||
          disabled
        }
        accessibilityRole="switch"
        accessibilityLabel={title}
        accessibilityHint={description}
        accessibilityState={{
          checked: value,
          disabled:
            preferencesLoading ||
            preferencesLoadError ||
            isSavingPreferences ||
            disabled,
        }}
        trackColor={{
          false: `${colors.textMuted}55`,
          true: `${colors.primary}66`,
        }}
        thumbColor={value ? colors.primary : colors.card}
        ios_backgroundColor={`${colors.textMuted}55`}
      />
    </View>
  );

  const renderFrequencyOption = (
    value: SavedSearchFrequency,
    label: string,
  ) => {
    const selected = preferences.savedSearchFrequency === value;
    const disabled =
      preferencesLoading ||
      preferencesLoadError ||
      isSavingPreferences ||
      !preferences.notificationsEnabled ||
      !preferences.savedSearchMatches;

    return (
      <Pressable
        key={value}
        accessibilityRole="radio"
        accessibilityState={{ selected, disabled }}
        disabled={disabled}
        onPress={() => void updatePreference("savedSearchFrequency", value)}
        style={[
          styles.frequencyOption,
          {
            borderColor: selected ? colors.primary : colors.border,
            backgroundColor: selected
              ? `${colors.primary}18`
              : colors.background,
          },
        ]}
      >
        <Text
          style={[
            styles.frequencyLabel,
            { color: selected ? colors.primary : colors.textMuted },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const renderPermissionRow = (
    title: string,
    description: string,
    icon: React.ComponentProps<typeof Ionicons>["name"],
    status?: PermissionStatus,
    last?: boolean,
  ) => {
    const statusColor = status === "granted" ? "#15803d" : colors.textMuted;

    return (
      <View
        key={title}
        style={[
          styles.permissionRow,
          !last && {
            borderBottomColor: colors.border,
            borderBottomWidth: StyleSheet.hairlineWidth,
          },
        ]}
      >
        <View
          style={[
            styles.permissionIcon,
            { backgroundColor: `${colors.primary}18` },
          ]}
        >
          <Ionicons name={icon} size={19} color={colors.primary} />
        </View>
        <View style={styles.permissionCopy}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.rowDescription, { color: colors.textMuted }]}>
            {description}
          </Text>
        </View>
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : status ? (
          <Text style={[styles.permissionStatus, { color: statusColor }]}>
            {permissionLabel[status]}
          </Text>
        ) : null}
      </View>
    );
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
    >
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          General settings
        </Text>
        <Text style={[styles.pageDescription, { color: colors.textMuted }]}>
          Manage your preferences, device permissions, and app information.
        </Text>
      </View>

      <View style={styles.sectionHeading}>
        <View style={styles.sectionTitleRow}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Notifications
          </Text>
          <Switch
            value={preferences.notificationsEnabled}
            onValueChange={(value) =>
              void updatePreference("notificationsEnabled", value)
            }
            disabled={
              preferencesLoading ||
              preferencesLoadError ||
              isSavingPreferences
            }
            accessibilityRole="switch"
            accessibilityLabel="Enable notifications"
            accessibilityHint={notificationsMasterDescription}
            accessibilityState={{
              checked: preferences.notificationsEnabled,
              disabled:
                preferencesLoading ||
                preferencesLoadError ||
                isSavingPreferences,
            }}
            trackColor={{
              false: `${colors.textMuted}55`,
              true: `${colors.primary}66`,
            }}
            thumbColor={
              preferences.notificationsEnabled ? colors.primary : colors.card
            }
            ios_backgroundColor={`${colors.textMuted}55`}
          />
        </View>
        <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
          {notificationsMasterDescription}
        </Text>
      </View>
      <View
        style={[
          styles.group,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {renderPreferenceRow(
          "Messages and viewing updates",
          "Get alerts for new messages, replies, and viewing-request changes.",
          "chatbubble-ellipses-outline",
          preferences.messageAndViewingUpdates,
          (value) => void updatePreference("messageAndViewingUpdates", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Deals",
          "Get alerts about new and expiring deals on properties you have saved.",
          "pricetag-outline",
          preferences.deals,
          (value) => void updatePreference("deals", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "New listings from owners you have messaged",
          "Hear when an owner you contacted posts another property.",
          "home-outline",
          preferences.contactedOwnerListings,
          (value) => void updatePreference("contactedOwnerListings", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Saved-search matches",
          "Get alerts when new properties match searches you choose to save.",
          "search-outline",
          preferences.savedSearchMatches,
          (value) => void updatePreference("savedSearchMatches", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Saved-property price and availability changes",
          "Get an alert when the price or availability changes on a property you saved.",
          "cash-outline",
          preferences.savedPropertyUpdates,
          (value) => void updatePreference("savedPropertyUpdates", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Saved-property reminders",
          "Get occasional reminders about saved properties that are still available.",
          "bookmark-outline",
          preferences.savedPropertyReminders,
          (value) => void updatePreference("savedPropertyReminders", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Terms and conditions updates",
          "Get optional alerts about terms updates. Required notices will still appear.",
          "document-text-outline",
          preferences.termsAndConditionsUpdates,
          (value) => void updatePreference("termsAndConditionsUpdates", value),
          false,
          !preferences.notificationsEnabled,
        )}
        {renderPreferenceRow(
          "Customer care updates",
          "Get notified when customer care replies to your support request.",
          "help-circle-outline",
          preferences.customerCareUpdates,
          (value) => void updatePreference("customerCareUpdates", value),
          !isPropertyOwner,
          !preferences.notificationsEnabled,
        )}
        {isPropertyOwner
          ? renderPreferenceRow(
              "New property reviews",
              "Get notified when someone posts a review of your property.",
              "star-outline",
              preferences.ownerPropertyReviews,
              (value) => void updatePreference("ownerPropertyReviews", value),
              false,
              !preferences.notificationsEnabled,
            )
          : null}
        {isPropertyOwner
          ? renderPreferenceRow(
              "Property save activity",
              "Get aggregate alerts when users save your properties; saver identities are not shared.",
              "heart-outline",
              preferences.ownerPropertySaves,
              (value) => void updatePreference("ownerPropertySaves", value),
              true,
              !preferences.notificationsEnabled,
            )
          : null}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Email preferences
        </Text>
      </View>
      <View
        style={[
          styles.group,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {renderPreferenceRow(
          "Email notifications",
          "Preference for account and property updates by email.",
          "mail-outline",
          preferences.emailNotifications,
          (value) => void updatePreference("emailNotifications", value),
        )}
        {renderPreferenceRow(
          "Product news and offers",
          "Optional marketing emails. This is separate from service updates.",
          "megaphone-outline",
          preferences.promotionalEmails,
          (value) => void updatePreference("promotionalEmails", value),
          true,
        )}
      </View>

      <View
        style={[
          styles.frequencyGroup,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <Text style={[styles.rowTitle, { color: colors.text }]}>
          Saved-search alert frequency
        </Text>
        <Text style={[styles.rowDescription, { color: colors.textMuted }]}>
          Choose how often matching-property alerts should be sent when
          saved-search delivery is available.
        </Text>
        <View
          accessibilityRole="radiogroup"
          accessibilityLabel="Saved-search alert frequency"
          style={styles.frequencyOptions}
        >
          {renderFrequencyOption("off", "Off")}
          {renderFrequencyOption("daily", "Daily")}
          {renderFrequencyOption("weekly", "Weekly")}
        </View>
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Search and discovery
        </Text>
      </View>
      <View
        style={[
          styles.group,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {renderPreferenceRow(
          "Location-based recommendations",
          "Preference only. Location-based recommendations are not connected yet.",
          "navigate-outline",
          preferences.locationRecommendations,
          (value) => void updatePreference("locationRecommendations", value),
          true,
        )}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Privacy
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
          Listing views are not currently shared with property owners.
        </Text>
      </View>
      <View
        style={[
          styles.group,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {renderPreferenceRow(
          "Notify owners when I view a property",
          "Save your choice for a future feature. This setting does not currently send view activity.",
          "eye-outline",
          preferences.notifyOwnersOnPropertyView,
          (value) => void updatePreference("notifyOwnersOnPropertyView", value),
          true,
        )}
      </View>

      {preferencesLoading ? (
        <View style={styles.preferenceStatusRow}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text
            style={[styles.preferenceStatusText, { color: colors.textMuted }]}
          >
            Loading saved preferences…
          </Text>
        </View>
      ) : null}
      {preferencesLoadError ? (
        <View style={styles.errorRow}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Preferences could not be loaded. Your saved choices are unchanged.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={reloadPreferences}
            hitSlop={8}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}
      {preferencesSaveError ? (
        <View style={styles.errorRow}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Preferences could not be saved or synced. Please retry.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void retrySync()}
            hitSlop={8}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Device permissions
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textMuted }]}>
          Permission status is read from your device. Change access in system
          settings.
        </Text>
      </View>
      <View
        style={[
          styles.group,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        {renderPermissionRow(
          "Camera",
          "Used when taking a profile photo or attaching an image.",
          "camera-outline",
          permissions?.camera,
        )}
        {renderPermissionRow(
          "Photos and media",
          "Used when choosing images from your device.",
          "images-outline",
          permissions?.photos,
        )}
        {renderPermissionRow(
          "Location",
          "Used for location-based property discovery.",
          "location-outline",
          permissions?.location,
          true,
        )}
      </View>

      {loadError ? (
        <View style={styles.errorRow}>
          <Text style={[styles.errorText, { color: colors.error }]}>
            Permission status could not be loaded.
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => void loadPermissions()}
            hitSlop={8}
          >
            <Text style={[styles.retryText, { color: colors.primary }]}>
              Retry
            </Text>
          </Pressable>
        </View>
      ) : null}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Open device app settings"
        onPress={openDeviceSettings}
        style={[styles.settingsLink, { borderColor: colors.border }]}
      >
        <Text style={[styles.settingsLinkText, { color: colors.primary }]}>
          Open device settings
        </Text>
        <Ionicons name="open-outline" size={17} color={colors.primary} />
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
      </View>
      <View
        style={[
          styles.group,
          styles.aboutGroup,
          { backgroundColor: colors.card, borderColor: colors.border },
        ]}
      >
        <View style={[styles.aboutRow, { borderBottomColor: colors.border }]}>
          <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>
            App name
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>
            {appConfig.expo.name}
          </Text>
        </View>
        <View style={styles.aboutRow}>
          <Text style={[styles.aboutLabel, { color: colors.textMuted }]}>
            Version
          </Text>
          <Text style={[styles.aboutValue, { color: colors.text }]}>
            {appConfig.expo.version}
          </Text>
        </View>
      </View>
      <View style={{ height: 24 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 28,
  },
  pageHeader: {
    marginBottom: 10,
  },
  pageTitle: {
    fontSize: 23,
    fontWeight: "700",
  },
  pageDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 5,
  },
  sectionHeading: {
    marginTop: 22,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionDescription: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  group: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
  },
  permissionRow: {
    minHeight: 74,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingVertical: 11,
  },
  permissionIcon: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  permissionCopy: {
    flex: 1,
    minWidth: 0,
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  rowDescription: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3,
  },
  permissionStatus: {
    fontSize: 12,
    fontWeight: "600",
    maxWidth: 112,
    textAlign: "right",
  },
  frequencyOption: {
    minHeight: 38,
    minWidth: 72,
    borderWidth: 1,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  frequencyLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  frequencyGroup: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 13,
    paddingVertical: 12,
    marginTop: 10,
  },
  frequencyOptions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
  },
  preferenceStatusRow: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  preferenceStatusText: {
    fontSize: 12,
  },
  preferenceError: {
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  errorRow: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  errorText: {
    fontSize: 13,
    flex: 1,
  },
  retryText: {
    fontSize: 14,
    fontWeight: "700",
    padding: 8,
  },
  settingsLink: {
    minHeight: 46,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  settingsLinkText: {
    fontSize: 14,
    fontWeight: "600",
  },
  aboutGroup: {
    paddingHorizontal: 14,
  },
  aboutRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  aboutLabel: {
    fontSize: 14,
  },
  aboutValue: {
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
    marginLeft: 12,
    textAlign: "right",
  },
});

export default ApplicationSettings;
