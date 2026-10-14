import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  Pressable,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useAuth } from "../AuthContext";
import { Ionicons } from "@expo/vector-icons";
import { apiRequest } from "../../../shared/queryClient";
import ProfileEditForm, {
  ProfileData,
} from "../../../shared/components/ProfileEditForm";

interface AccountScreenProps {
  // Add props here if needed
}

const AccountScreen: React.FC<AccountScreenProps> = () => {
  const { colors } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
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
  const isElevatedRole =
    user?.role === "landlord" || user?.role === "propertyManager";
  const deleteTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const deleteRequestStarted = useRef(false);

  useEffect(
    () => () => {
      if (deleteTimer.current) {
        clearInterval(deleteTimer.current);
      }
    },
    [],
  );

  const handleSaveProfile = async (profileData: ProfileData) => {
    const response = await apiRequest("PATCH", "/users/me", profileData);
    const result = await response.json();
    if (!result?.success || !result.user) {
      throw new Error(result?.message || "Unable to update profile");
    }
    await updateUser(result.user);
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
      Alert.alert(
        "Password updated",
        result.message || "Your password changed.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setIsPasswordModalVisible(false);
    } catch (error) {
      Alert.alert(
        "Unable to update password",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  const submitAccountDeletion = async (password: string) => {
    if (deleteRequestStarted.current) return;
    deleteRequestStarted.current = true;
    setIsDeleting(true);
    try {
      const response = await apiRequest("DELETE", "/users/me", { password });
      const result = await response.json();
      if (!result?.success) {
        throw new Error(result?.message || "Unable to delete account");
      }
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

    setDeleteCountdown(10);
    setIsCountdownStarted(true);
    let remaining = 10;
    deleteTimer.current = setInterval(() => {
      remaining -= 1;
      setDeleteCountdown(remaining);
      if (remaining <= 0) {
        if (deleteTimer.current) clearInterval(deleteTimer.current);
        deleteTimer.current = null;
        void submitAccountDeletion(deletePassword);
      }
    }, 1000);
  };

  const cancelDelete = () => {
    if (deleteTimer.current) {
      clearInterval(deleteTimer.current);
      deleteTimer.current = null;
    }
    setIsDeleteModalVisible(false);
    setIsCountdownStarted(false);
    setDeleteCountdown(10);
    setDeletePassword("");
  };

  const displayName = [user?.firstName, user?.lastName]
    .filter(Boolean)
    .join(" ");
  const roleLabel = user?.role === "propertyManager"
    ? "Property manager"
    : user?.role === "landlord"
      ? "Landlord"
      : "Member";
  const detailRows = [
    { label: "Email", value: user?.email },
    { label: "Phone", value: user?.phoneNumber },
    { label: "Date of birth", value: user?.dob },
    { label: "Gender", value: user?.gender },
    ...((user?.role === "landlord" || user?.role === "propertyManager") && user.nin
      ? [{ label: "NIN", value: user.nin }]
      : []),
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.identityHeader, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          {user?.avatar?.url ? (
            <Image source={{ uri: user.avatar.url }} style={styles.avatarImage} />
          ) : (
            <Text style={styles.avatarInitials}>
              {(user?.firstName?.[0] || user?.email?.[0] || "U").toUpperCase()}
              {user?.lastName?.[0]?.toUpperCase() || ""}
            </Text>
          )}
        </View>
        <View style={styles.identityText}>
          <Text style={[styles.identityName, { color: colors.text }]} numberOfLines={1}>
            {displayName || "Your account"}
          </Text>
          <Text style={[styles.identityEmail, { color: colors.textMuted }]} numberOfLines={1}>
            {user?.email || "No email added"}
          </Text>
          <Text style={[styles.roleLabel, { color: colors.primary }]}>{roleLabel}</Text>
        </View>
        {user && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setIsProfileModalVisible(true)}
            style={[styles.editButton, { borderColor: colors.border }]}
          >
            <Ionicons name="create-outline" size={18} color={colors.primary} />
            <Text style={[styles.editButtonText, { color: colors.primary }]}>Edit</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Personal information</Text>
      </View>
      <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {detailRows.map((item, index) => (
          <View
            key={item.label}
            style={[
              styles.detailRow,
              index < detailRows.length - 1 && { borderBottomColor: colors.border, borderBottomWidth: StyleSheet.hairlineWidth },
            ]}
          >
            <Text style={[styles.detailLabel, { color: colors.textMuted }]}>{item.label}</Text>
            <Text style={[styles.detailValue, { color: item.value ? colors.text : colors.textMuted }]} numberOfLines={2}>
              {item.value || "Not added"}
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Change password"
        onPress={() => setIsPasswordModalVisible(true)}
        style={[styles.actionRow, { backgroundColor: colors.card, borderColor: colors.border }]}
      >
        <View style={[styles.actionIcon, { backgroundColor: colors.primary + "18" }]}>
          <Ionicons name="lock-closed-outline" size={20} color={colors.primary} />
        </View>
        <View style={styles.actionCopy}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Change password</Text>
          <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>Update your sign-in credentials</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={styles.sectionHeading}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account actions</Text>
      </View>
      <View style={[styles.dangerSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.dangerCopy}>
          <Text style={[styles.actionTitle, { color: colors.text }]}>Delete account</Text>
          <Text style={[styles.actionSubtitle, { color: colors.textMuted }]}>
            Your account and personal data will be removed.
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete account"
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isDeleting}
          style={[styles.deleteButton, { borderColor: colors.destructive }]}
        >
          <Text style={[styles.deleteButtonText, { color: colors.destructive }]}>
            {isDeleting ? "Deleting..." : "Delete account"}
          </Text>
        </Pressable>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={logout}
        style={[styles.signOutButton, { borderColor: colors.border }]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.textMuted} />
        <Text style={[styles.signOutText, { color: colors.textMuted }]}>Sign out</Text>
      </Pressable>

      <Modal
        visible={isPasswordModalVisible}
        animationType="slide"
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "bottom"]}>
          <KeyboardAvoidingView
            style={styles.passwordModal}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Change password</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close password form"
                onPress={() => setIsPasswordModalVisible(false)}
                hitSlop={10}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.passwordForm} keyboardShouldPersistTaps="handled">
            <Text style={[styles.passwordIntro, { color: colors.textMuted }]}>Use a strong password that you do not use elsewhere.</Text>
            {[
              { label: "Current password", value: currentPassword, setValue: setCurrentPassword, visible: showCurrentPassword, setVisible: setShowCurrentPassword },
              { label: "New password", value: newPassword, setValue: setNewPassword, visible: showNewPassword, setVisible: setShowNewPassword },
              { label: "Confirm new password", value: confirmPassword, setValue: setConfirmPassword, visible: showConfirmPassword, setVisible: setShowConfirmPassword },
            ].map((field) => (
              <View key={field.label} style={styles.passwordField}>
                <Text style={[styles.fieldLabel, { color: colors.text }]}>{field.label}</Text>
                <View style={[styles.passwordInputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <TextInput
                    accessibilityLabel={field.label}
                    style={[styles.passwordInput, { color: colors.text }]}
                    value={field.value}
                    onChangeText={field.setValue}
                    secureTextEntry={!field.visible}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                  />
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`${field.visible ? "Hide" : "Show"} ${field.label.toLowerCase()}`}
                    onPress={() => field.setVisible(!field.visible)}
                    hitSlop={8}
                  >
                    <Ionicons name={field.visible ? "eye-off-outline" : "eye-outline"} size={21} color={colors.textMuted} />
                  </Pressable>
                </View>
              </View>
            ))}
            <Pressable
              accessibilityRole="button"
              onPress={handleChangePassword}
              disabled={isChangingPassword}
              style={[styles.savePasswordButton, { backgroundColor: colors.primary }]}
            >
              {isChangingPassword ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.savePasswordText}>Update password</Text>}
            </Pressable>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsPasswordModalVisible(false)}
              style={styles.cancelPasswordButton}
            >
              <Text style={[styles.cancelPasswordText, { color: colors.textMuted }]}>Cancel</Text>
            </Pressable>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      </Modal>

      <Modal
        visible={isProfileModalVisible && Boolean(user)}
        animationType="slide"
        onRequestClose={() => setIsProfileModalVisible(false)}
      >
        {user && (
          <ProfileEditForm
            user={user}
            onClose={() => setIsProfileModalVisible(false)}
            onSave={handleSaveProfile}
          />
        )}
      </Modal>

      <Modal
        visible={isDeleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.deleteOverlay}>
          <View style={[styles.deleteDialog, { backgroundColor: colors.card }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>
              Delete account?
            </Text>
            <Text style={{ color: colors.textMuted, marginBottom: 12 }}>
              Your account will be removed. Any listings you own will be
              archived.
              {isElevatedRole
                ? " Deletion starts when the 10-second countdown ends."
                : " This cannot be undone."}
            </Text>
            {!isCountdownStarted && (
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.background, color: colors.text },
                ]}
                placeholder="Confirm with your password"
                placeholderTextColor={colors.textMuted}
                value={deletePassword}
                onChangeText={setDeletePassword}
                secureTextEntry
              />
            )}
            {isCountdownStarted && (
              <Text style={[styles.countdown, { color: colors.destructive }]}>
                {deleteCountdown > 0
                  ? `Deleting in ${deleteCountdown} seconds`
                  : "Deleting account..."}
              </Text>
            )}
            {!isCountdownStarted && (
              <TouchableOpacity
                style={[
                  styles.dialogButton,
                  { backgroundColor: colors.destructive },
                ]}
                onPress={() =>
                  isElevatedRole
                    ? startDeleteCountdown()
                    : deletePassword
                      ? void submitAccountDeletion(deletePassword)
                      : Alert.alert(
                          "Password required",
                          "Enter your password to continue.",
                        )
                }
                disabled={isDeleting}
              >
                <Text style={styles.dialogButtonText}>
                  {isElevatedRole
                    ? "Start 10-second countdown"
                    : "Delete account"}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={[styles.dialogButton, { backgroundColor: colors.muted }]}
              onPress={cancelDelete}
              disabled={isDeleting}
            >
              <Text style={styles.dialogButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 32,
  },
  identityHeader: {
    minHeight: 96,
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarInitials: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "700",
  },
  identityText: {
    flex: 1,
    minWidth: 0,
  },
  identityName: {
    fontSize: 17,
    fontWeight: "700",
  },
  identityEmail: {
    fontSize: 13,
    marginTop: 3,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 5,
  },
  editButton: {
    minHeight: 42,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionHeading: {
    marginTop: 24,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  section: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    minHeight: 56,
    paddingVertical: 10,
  },
  detailLabel: {
    fontSize: 14,
    flexShrink: 0,
  },
  detailValue: {
    flex: 1,
    marginLeft: 18,
    textAlign: "right",
    fontSize: 14,
    lineHeight: 20,
  },
  actionRow: {
    minHeight: 76,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionCopy: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  actionSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  dangerSection: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 14,
    gap: 14,
  },
  dangerCopy: {
    gap: 2,
  },
  deleteButton: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  signOutButton: {
    minHeight: 52,
    marginTop: 18,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "600",
  },
  passwordModal: {
    flex: 1,
  },
  modalHeader: {
    minHeight: 58,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  passwordForm: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 36,
  },
  passwordIntro: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 22,
  },
  passwordField: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  passwordInputWrap: {
    minHeight: 52,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  passwordInput: {
    flex: 1,
    minHeight: 50,
    fontSize: 16,
  },
  savePasswordButton: {
    minHeight: 50,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  savePasswordText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },
  cancelPasswordText: {
    fontSize: 14,
    fontWeight: "600",
  },
  cancelPasswordButton: {
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  deleteOverlay: {
    flex: 1,
    justifyContent: "center",
    padding: 22,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
  },
  deleteDialog: {
    borderRadius: 12,
    padding: 20,
  },
  dialogTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  countdown: {
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginVertical: 16,
  },
  dialogButton: {
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    marginTop: 10,
    paddingHorizontal: 12,
  },
  dialogButtonText: {
    color: "white",
    fontWeight: "700",
  },
  input: {
    width: "100%",
    minHeight: 48,
    borderRadius: 8,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
  },
});

export default AccountScreen;
