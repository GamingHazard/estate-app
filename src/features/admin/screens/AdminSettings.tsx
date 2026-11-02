import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  AppState,
  Image,
  Linking,
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../../shared/theme/ThemeContext";
import {
  GeneralSettingsPreferences,
  loadGeneralSettings,
  saveGeneralSettings,
} from "../../settings/generalSettingsStore";
import { apiRequest } from "../../../shared/queryClient";

type SettingsSection =
  | "account"
  | "workspace"
  | "notifications"
  | "security"
  | "permissions"
  | "exports"
  | "support";

type DevicePermission = "granted" | "not-requested" | "not-allowed" | "blocked";
type DevicePermissions = Record<"camera" | "photos" | "location", DevicePermission>;

const permissionStatusLabel: Record<DevicePermission, string> = {
  granted: "Granted",
  "not-requested": "Not yet granted",
  "not-allowed": "Not yet granted",
  blocked: "Blocked",
};

const normalizePermissionStatus = (permission: {
  granted: boolean;
  status: string;
  canAskAgain: boolean;
}): DevicePermission => {
  if (permission.granted) return "granted";
  if (permission.status === "undetermined") return "not-requested";
  return permission.canAskAgain ? "not-allowed" : "blocked";
};

const sections: Array<{
  key: SettingsSection;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>["name"];
}> = [
  { key: "account", label: "Account", icon: "person-outline" },
  { key: "workspace", label: "Workspace & Appearance", icon: "color-palette-outline" },
  { key: "notifications", label: "Notifications", icon: "notifications-outline" },
  { key: "security", label: "Security", icon: "shield-checkmark-outline" },
  { key: "permissions", label: "Access & Permissions", icon: "key-outline" },
  { key: "exports", label: "Data & Exports", icon: "download-outline" },
  { key: "support", label: "Support & Legal", icon: "headset-outline" },
];

export function AdminSettings() {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigation = useNavigation<any>();
  const { width } = useWindowDimensions();
  const compact = width < 720;
  const [activeSection, setActiveSection] = useState<SettingsSection>("account");
  const [search, setSearch] = useState("");
  const [preferences, setPreferences] = useState<GeneralSettingsPreferences | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");
  const [devicePermissions, setDevicePermissions] = useState<DevicePermissions | null>(null);
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteCountdown, setDeleteCountdown] = useState(10);
  const [isCountdownStarted, setIsCountdownStarted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deleteRequestStarted = useRef(false);

  useEffect(() => () => {
    if (deleteTimer.current) clearInterval(deleteTimer.current);
  }, []);

  const closePasswordModal = () => {
    setIsPasswordModalVisible(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert("Missing information", "Complete all password fields.");
      return;
    }
    if (newPassword.length < 8) {
      Alert.alert("Password too short", "Use at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Check the new password fields.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const response = await apiRequest("PATCH", "/users/me/password", {
        currentPassword,
        newPassword,
      });
      const result = await response.json();
      Alert.alert("Password updated", result.message || "Your password changed.");
      closePasswordModal();
    } catch (error) {
      Alert.alert(
        "Unable to update password",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const submitAccountDeletion = async () => {
    if (deleteRequestStarted.current) return;
    deleteRequestStarted.current = true;
    setIsDeleting(true);
    try {
      const response = await apiRequest("DELETE", "/users/me", {
        password: deletePassword,
      });
      const result = await response.json();
      if (!result?.success) {
        throw new Error(result?.message || "Unable to delete account");
      }
      setIsDeleteModalVisible(false);
      await logout();
    } catch (error) {
      deleteRequestStarted.current = false;
      setIsDeleting(false);
      setIsCountdownStarted(false);
      setDeleteCountdown(10);
      Alert.alert(
        "Unable to delete account",
        error instanceof Error ? error.message : "Please try again.",
      );
    }
  };

  const startDeleteCountdown = () => {
    if (!deletePassword) {
      Alert.alert("Password required", "Enter your password to continue.");
      return;
    }
    if (deleteTimer.current || deleteRequestStarted.current) return;

    setIsCountdownStarted(true);
    setDeleteCountdown(10);
    let remaining = 10;
    deleteTimer.current = setInterval(() => {
      remaining -= 1;
      setDeleteCountdown(remaining);
      if (remaining <= 0) {
        if (deleteTimer.current) clearInterval(deleteTimer.current);
        deleteTimer.current = null;
        void submitAccountDeletion();
      }
    }, 1000);
  };

  const cancelAccountDeletion = () => {
    if (deleteTimer.current) clearInterval(deleteTimer.current);
    deleteTimer.current = null;
    setIsDeleteModalVisible(false);
    setIsCountdownStarted(false);
    setDeleteCountdown(10);
    setDeletePassword("");
  };

  useEffect(() => {
    void loadGeneralSettings(user?.id ?? null).then(setPreferences);
  }, [user?.id]);

  const loadDevicePermissions = useCallback(async () => {
    try {
      const [camera, photos, location] = await Promise.all([
        ImagePicker.getCameraPermissionsAsync(),
        ImagePicker.getMediaLibraryPermissionsAsync(),
        Location.getForegroundPermissionsAsync(),
      ]);
      setDevicePermissions({
        camera: normalizePermissionStatus(camera),
        photos: normalizePermissionStatus(photos),
        location: normalizePermissionStatus(location),
      });
    } catch {
      setDevicePermissions({
        camera: "not-requested",
        photos: "not-requested",
        location: "not-requested",
      });
    }
  }, []);

  useEffect(() => {
    void loadDevicePermissions();
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") void loadDevicePermissions();
    });
    return () => subscription.remove();
  }, [loadDevicePermissions]);

  const requestCameraPermission = async () => {
    await ImagePicker.requestCameraPermissionsAsync();
    await loadDevicePermissions();
  };

  const requestPhotosPermission = async () => {
    await ImagePicker.requestMediaLibraryPermissionsAsync();
    await loadDevicePermissions();
  };

  const requestLocationPermission = async () => {
    await Location.requestForegroundPermissionsAsync();
    await loadDevicePermissions();
  };

  const openPermissionSettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert("Unable to open settings", "Open your device settings to manage app permissions.");
    }
  };

  const updatePreference = async <Key extends keyof GeneralSettingsPreferences>(
    key: Key,
    value: GeneralSettingsPreferences[Key],
  ) => {
    if (!preferences) return;
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSaveState("saving");
    try {
      await saveGeneralSettings(user?.id ?? null, next);
      setSaveState("saved");
      setTimeout(() => setSaveState("idle"), 1400);
    } catch {
      Alert.alert("Unable to save preference", "Please try again.");
      setSaveState("idle");
    }
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    header: { paddingBottom: 18 },
    title: { color: colors.text, fontSize: 26, fontWeight: "800" },
    subtitle: { color: colors.textMuted, fontSize: 13, marginTop: 5 },
    profileCard: {
      marginTop: 16,
      padding: 14,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: `${colors.primary}18`,
      marginRight: 12,
      overflow: "hidden",
    },
    avatarImage: { width: "100%", height: "100%" },
    profileName: { color: colors.text, fontSize: 16, fontWeight: "800" },
    profileMeta: { color: colors.textMuted, fontSize: 12, marginTop: 3 },
    search: {
      minHeight: 42,
      marginTop: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      paddingHorizontal: 12,
      color: colors.text,
      backgroundColor: colors.card,
    },
    layout: { flex: 1, flexDirection: compact ? "column" : "row", gap: 14 },
    navigation: compact
      ? {
          flexDirection: "row",
          gap: 8,
        }
      : {
          width: 220,
          gap: 4,
        },
    navButton: {
      minHeight: 44,
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      paddingHorizontal: 12,
      borderRadius: 10,
    },
    activeNav: { backgroundColor: `${colors.primary}18` },
    navText: { color: colors.textMuted, fontSize: 13, fontWeight: "700" },
    activeNavText: { color: colors.primary },
    content: { flex: 1 },
    section: { marginBottom: 22 },
    sectionHeader: { marginBottom: 12 },
    sectionTitle: { color: colors.text, fontSize: 20, fontWeight: "800" },
    sectionDescription: { color: colors.textMuted, fontSize: 13, marginTop: 4, lineHeight: 19 },
    card: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: colors.card,
      overflow: "hidden",
      marginBottom: 10,
    },
    row: {
      minHeight: 64,
      paddingHorizontal: 14,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: 12,
    },
    rowCopy: { flex: 1 },
    rowTitle: { color: colors.text, fontSize: 14, fontWeight: "700" },
    rowDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 3 },
    status: {
      borderRadius: 20,
      paddingHorizontal: 8,
      paddingVertical: 4,
      backgroundColor: `${colors.primary}18`,
    },
    statusText: { color: colors.primary, fontSize: 10, fontWeight: "800" },
    disabledText: { color: colors.textMuted },
    choices: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
    choice: {
      minHeight: 36,
      paddingHorizontal: 10,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.background,
    },
    activeChoice: { borderColor: colors.primary, backgroundColor: `${colors.primary}18` },
    choiceText: { color: colors.text, fontWeight: "700", fontSize: 12 },
    activeChoiceText: { color: colors.primary },
    grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    gridCard: {
      flexGrow: 1,
      flexBasis: compact ? "100%" : 220,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.card,
      padding: 14,
    },
    gridTitle: { color: colors.text, fontSize: 14, fontWeight: "800", marginTop: 10 },
    gridDescription: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 5 },
    dangerCard: { borderColor: `${colors.destructive}55` },
    dangerText: { color: colors.destructive },
    passwordModal: { flex: 1, backgroundColor: colors.background },
    passwordModalHeader: {
      minHeight: 58,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      backgroundColor: colors.card,
    },
    passwordModalTitle: { color: colors.text, fontSize: 18, fontWeight: "800" },
    passwordForm: { padding: 16, gap: 14 },
    passwordIntro: { color: colors.textMuted, fontSize: 13, lineHeight: 19 },
    passwordFieldLabel: { color: colors.text, fontSize: 13, fontWeight: "700", marginBottom: 7 },
    passwordInputWrap: {
      minHeight: 48,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 10,
      backgroundColor: colors.card,
      flexDirection: "row",
      alignItems: "center",
    },
    passwordInput: { flex: 1, color: colors.text, paddingVertical: 10 },
    updatePasswordButton: {
      minHeight: 48,
      borderRadius: 10,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
      marginTop: 4,
    },
    updatePasswordText: { color: "#ffffff", fontWeight: "800" },
    cancelPasswordButton: { minHeight: 42, alignItems: "center", justifyContent: "center" },
    cancelPasswordText: { color: colors.textMuted, fontWeight: "700" },
    deleteOverlay: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    },
    deleteDialog: {
      width: "100%",
      maxWidth: 420,
      borderWidth: 1,
      borderRadius: 14,
      padding: 18,
    },
  });

  const SettingRow = ({
    title,
    description,
    value,
    onValueChange,
    disabled = false,
  }: {
    title: string;
    description: string;
    value: boolean;
    onValueChange: (value: boolean) => void;
    disabled?: boolean;
  }) => (
    <View style={styles.row}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, disabled && styles.disabledText]}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityRole="switch"
        accessibilityLabel={title}
      />
    </View>
  );

  const ActionRow = ({
    title,
    description,
    status,
    onPress,
    danger = false,
  }: {
    title: string;
    description: string;
    status?: string;
    onPress?: () => void;
    danger?: boolean;
  }) => (
    <TouchableOpacity style={styles.row} onPress={onPress} disabled={!onPress}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, danger && styles.dangerText]}>{title}</Text>
        <Text style={styles.rowDescription}>{description}</Text>
      </View>
      {status ? (
        <View style={styles.status}><Text style={styles.statusText}>{status}</Text></View>
      ) : (
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      )}
    </TouchableOpacity>
  );

  const SectionHeader = ({ title, description }: { title: string; description: string }) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionDescription}>{description}</Text>
    </View>
  );

  const filteredSections = sections.filter((section) =>
    `${section.label} ${section.key}`.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const roleLabel = user?.role === "propertyManager"
    ? "Property manager"
    : user?.role === "landlord"
      ? "Landlord"
      : "Administrator";

  const renderContent = () => {
    switch (activeSection) {
      case "account":
        return (
          <View style={styles.section}>
            <SectionHeader title="Account" description="Manage your identity, profile information, and account access." />
            <View style={styles.card}>
              <ActionRow title="Profile & avatar" description="Update your name, contact details, avatar, and public profile." status="Manage" onPress={() => navigation.navigate("Account")} />
              <ActionRow title="Email address" description={user?.email || "Not available"} status="Verified" />
              <ActionRow title="Logout" description="Sign out of this device." danger onPress={() => void logout()} />
            </View>
            <View style={[styles.card, styles.dangerCard]}>
              <ActionRow title="Delete account" description="Permanently remove your account and its data." status="Requires confirmation" danger onPress={() => setIsDeleteModalVisible(true)} />
            </View>
          </View>
        );
      case "workspace":
        return (
          <View style={styles.section}>
            <SectionHeader title="Workspace & Appearance" description="Customize the dashboard presentation and default workspace." />
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowCopy}>
                  <Text style={styles.rowTitle}>Appearance</Text>
                  <Text style={styles.rowDescription}>Current theme: {theme}</Text>
                </View>
                <View style={styles.choices}>
                  <TouchableOpacity style={[styles.choice, styles.activeChoice]} onPress={toggleTheme}>
                    <Text style={[styles.choiceText, styles.activeChoiceText]}>{theme === "dark" ? "Dark" : "Light"}</Text>
                  </TouchableOpacity>
                  <View style={styles.choice}><Text style={styles.choiceText}>System</Text></View>
                </View>
              </View>
              <View style={styles.row}>
                <View style={styles.rowCopy}><Text style={styles.rowTitle}>Dashboard density</Text><Text style={styles.rowDescription}>Choose how much information fits onscreen.</Text></View>
                <View style={styles.choices}>
                  <View style={[styles.choice, styles.activeChoice]}><Text style={[styles.choiceText, styles.activeChoiceText]}>Comfortable</Text></View>
                  <View style={styles.choice}><Text style={styles.choiceText}>Compact</Text></View>
                </View>
              </View>
            </View>
          </View>
        );
      case "notifications":
        if (!preferences) return null;
        return (
          <View style={styles.section}>
            <SectionHeader title="Notifications" description="Choose administrative updates and how often they should be delivered." />
            <View style={styles.card}>
              <SettingRow title="Push notifications" description="Receive important activity alerts on this device." value={preferences.pushNotifications} onValueChange={(value) => void updatePreference("pushNotifications", value)} />
              <SettingRow title="Email notifications" description="Receive administrative and account alerts by email." value={preferences.emailNotifications} onValueChange={(value) => void updatePreference("emailNotifications", value)} />
              <SettingRow title="Property updates" description="New submissions, approvals, listing changes, and publishing." value={preferences.savedPropertyUpdates} onValueChange={(value) => void updatePreference("savedPropertyUpdates", value)} />
              <SettingRow title="Messages and inquiries" description="New customer messages and viewing requests." value={preferences.messageAndViewingUpdates} onValueChange={(value) => void updatePreference("messageAndViewingUpdates", value)} />
            </View>
            <View style={styles.card}>
              <ActionRow title="Notification digest" description="Daily or weekly summary delivery." status={preferences.savedSearchFrequency} />
              <ActionRow title="Quiet hours" description="Pause non-critical alerts overnight." status="Coming soon" />
            </View>
            {saveState !== "idle" ? <Text style={styles.rowDescription}>{saveState === "saving" ? "Saving…" : "Preferences saved"}</Text> : null}
          </View>
        );
      case "security":
        return (
          <View style={styles.section}>
            <SectionHeader title="Security" description="Protect your account and review recent access controls." />
            <View style={styles.card}>
              <ActionRow title="Change password" description="Update your current sign-in password." status="Manage" onPress={() => setIsPasswordModalVisible(true)} />
              <ActionRow title="Two-factor authentication" description="Require an additional verification step when signing in." status="Coming soon" />
              <ActionRow title="Active sessions" description="Review devices currently signed in to this account." status="Coming soon" />
              <ActionRow title="Login alerts" description="Receive an alert after a new device signs in." status="Coming soon" />
            </View>
          </View>
        );
      case "permissions":
        return (
          <View style={styles.section}>
            <SectionHeader title="Access & Permissions" description="Review device permissions currently granted to the app and permissions it may request." />
            <View style={styles.card}>
              {[
                {
                  key: "camera",
                  title: "Camera",
                  description: "Take profile and business images for listings and account details.",
                  request: requestCameraPermission,
                },
                {
                  key: "photos",
                  title: "Photos and media",
                  description: "Choose existing images from the device for profiles and listings.",
                  request: requestPhotosPermission,
                },
                {
                  key: "location",
                  title: "Location",
                  description: "Use the device location for nearby property discovery.",
                  request: requestLocationPermission,
                },
              ].map((permission, index, permissions) => {
                const status = devicePermissions?.[permission.key as keyof DevicePermissions];
                const isBlocked = status === "blocked";
                return (
                  <ActionRow
                    key={permission.key}
                    title={permission.title}
                    description={permission.description}
                    status={status ? permissionStatusLabel[status] : "Checking"}
                    onPress={isBlocked ? openPermissionSettings : permission.request}
                  />
                );
              })}
            </View>
          </View>
        );
      case "exports":
        return (
          <View style={styles.section}>
            <SectionHeader title="Data & Exports" description="Prepare scoped exports for properties, deals, reviews, users, and audit activity." />
            <View style={styles.grid}>
              {["Properties", "Deals", "Reviews", "Users", "Audit activity"].map((item) => (
                <View key={item} style={styles.gridCard}>
                  <Ionicons name="document-text-outline" size={22} color={colors.primary} />
                  <Text style={styles.gridTitle}>{item}</Text>
                  <Text style={styles.gridDescription}>CSV or JSON export with date and status scope.</Text>
                  <Text style={[styles.gridDescription, { color: colors.primary, fontWeight: "800" }]}>COMING SOON</Text>
                </View>
              ))}
            </View>
          </View>
        );
      case "support":
        return (
          <View style={styles.section}>
            <SectionHeader title="Support & Legal" description="Find documentation, support, legal information, and app diagnostics." />
            <View style={styles.card}>
              <ActionRow title="Admin manual" description="Learn about dashboard workflows and moderation tools." status="Open" onPress={() => navigation.navigate("AdminManual")} />
              <ActionRow title="Customer care" description="Contact the estate support team." status="Open" onPress={() => navigation.navigate("Customer Care")} />
              <ActionRow title="Terms and conditions" description="Review the application's terms of service." status="Open" onPress={() => navigation.navigate("Terms-and-Conditions")} />
              <ActionRow title="Release notes" description="See recent dashboard improvements." status="Coming soon" />
            </View>
            <View style={styles.card}>
              <ActionRow title="App information" description="Estate App client information and build status." status="v1.0.0" />
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Settings</Text>
          <Text style={styles.subtitle}>Manage your account, workspace, security, and operations.</Text>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              {user?.avatar?.url ? (
                <Image source={{ uri: user.avatar.url }} style={styles.avatarImage} />
              ) : (
                <Ionicons name="person" size={24} color={colors.primary} />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>
                {[user?.firstName, user?.lastName].filter(Boolean).join(" ") || user?.username || "Administrator"}
              </Text>
              <Text style={styles.profileMeta}>{roleLabel} · {user?.email || "No email"}</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </View>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search settings"
            placeholderTextColor={colors.textMuted}
          />
        </View>
        <View style={styles.layout}>
          <ScrollView
            horizontal={compact}
            showsHorizontalScrollIndicator={false}
            style={compact ? { maxHeight: 52 } : undefined}
            contentContainerStyle={compact ? { gap: 8 } : undefined}
          >
            <View style={styles.navigation}>
              {filteredSections.map((section) => (
                <TouchableOpacity
                  key={section.key}
                  style={[styles.navButton, activeSection === section.key && styles.activeNav]}
                  onPress={() => setActiveSection(section.key)}
                >
                  <Ionicons
                    name={section.icon}
                    size={19}
                    color={activeSection === section.key ? colors.primary : colors.textMuted}
                  />
                  {!compact ? (
                    <Text style={[styles.navText, activeSection === section.key && styles.activeNavText]}>
                      {section.label}
                    </Text>
                  ) : null}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.content}>{renderContent()}</View>
        </View>
      </ScrollView>
      <Modal
        visible={isPasswordModalVisible}
        animationType="slide"
        onRequestClose={closePasswordModal}
      >
        <KeyboardAvoidingView
          style={styles.passwordModal}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={styles.passwordModalHeader}>
            <Text style={styles.passwordModalTitle}>Change password</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Close password form"
              onPress={closePasswordModal}
              disabled={isChangingPassword}
              hitSlop={10}
            >
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.passwordForm} keyboardShouldPersistTaps="handled">
            <Text style={styles.passwordIntro}>
              Use a strong password that you do not use elsewhere.
            </Text>
            {[
              { label: "Current password", value: currentPassword, setValue: setCurrentPassword, visible: showCurrentPassword, setVisible: setShowCurrentPassword },
              { label: "New password", value: newPassword, setValue: setNewPassword, visible: showNewPassword, setVisible: setShowNewPassword },
              { label: "Confirm new password", value: confirmPassword, setValue: setConfirmPassword, visible: showConfirmPassword, setVisible: setShowConfirmPassword },
            ].map((field) => (
              <View key={field.label}>
                <Text style={styles.passwordFieldLabel}>{field.label}</Text>
                <View style={styles.passwordInputWrap}>
                  <TextInput
                    accessibilityLabel={field.label}
                    style={styles.passwordInput}
                    value={field.value}
                    onChangeText={field.setValue}
                    secureTextEntry={!field.visible}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`${field.visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                    onPress={() => field.setVisible(!field.visible)}
                    hitSlop={8}
                  >
                    <Ionicons name={field.visible ? "eye-off-outline" : "eye-outline"} size={21} color={colors.textMuted} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity
              accessibilityRole="button"
              onPress={() => void handleChangePassword()}
              disabled={isChangingPassword}
              style={styles.updatePasswordButton}
            >
              {isChangingPassword ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.updatePasswordText}>Update password</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={closePasswordModal}
              disabled={isChangingPassword}
              style={styles.cancelPasswordButton}
            >
              <Text style={styles.cancelPasswordText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
      <Modal
        visible={isDeleteModalVisible}
        animationType="fade"
        transparent
        onRequestClose={cancelAccountDeletion}
      >
        <View style={[styles.deleteOverlay, { backgroundColor: "rgba(0,0,0,0.55)" }]}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={[styles.deleteDialog, { backgroundColor: colors.card, borderColor: colors.border }]}
          >
            <Text style={[styles.passwordModalTitle, { color: colors.destructive }]}>Delete account?</Text>
            <Text style={[styles.passwordIntro, { marginTop: 10 }]}>
              This permanently removes your account and cannot be undone.
            </Text>
            <Text style={styles.passwordFieldLabel}>Password</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                accessibilityLabel="Password"
                style={styles.passwordInput}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
                autoCapitalize="none"
                editable={!isCountdownStarted && !isDeleting}
              />
            </View>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={isCountdownStarted ? () => undefined : startDeleteCountdown}
              disabled={isCountdownStarted || isDeleting}
              style={[styles.updatePasswordButton, { backgroundColor: colors.destructive }]}
            >
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.updatePasswordText}>
                  {isCountdownStarted ? `Deleting in ${deleteCountdown} seconds` : "Start 10-second countdown"}
                </Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              accessibilityRole="button"
              onPress={cancelAccountDeletion}
              disabled={isDeleting}
              style={styles.cancelPasswordButton}
            >
              <Text style={styles.cancelPasswordText}>Cancel</Text>
            </TouchableOpacity>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}
