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
} from "react-native";
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
  const { colors, theme } = useTheme();
  const { logout, user, updateUser } = useAuth();
  const [isProfileModalVisible, setIsProfileModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.sectionHeading}>
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>
          Profile
        </Text>
      </View>
      <View
        style={{
          width: "100%",
          borderRadius: 8,
          backgroundColor: colors.card,
          padding: 10,
          position: "relative",
        }}
      >
        {user && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Edit profile"
            onPress={() => setIsProfileModalVisible(true)}
            style={[
              styles.iconButton,
              { backgroundColor: colors.card, elevation: 2, zIndex: 1 },
            ]}
          >
            <Ionicons name="create-outline" size={21} color={colors.primary} />
            <Text>Edit Profile</Text>
          </Pressable>
        )}
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>
          Personal Information
        </Text>
        <Text
          style={{ color: theme === "dark" ? "white" : "black", marginTop: 10 }}
        >
          Full Name
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>
          {user?.firstName || " "} {user?.lastName || "User Full Name"}
        </Text>

        <Text
          style={{ color: theme === "dark" ? "white" : "black", marginTop: 10 }}
        >
          Email
        </Text>
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}
        >
          <Text
            style={{ color: colors.textMuted, fontSize: 16, marginRight: 10 }}
          >
            {user?.email || "User Email"}
          </Text>
          <Text
            style={{
              backgroundColor: "lightpink",
              color: "red",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 12,
              fontSize: 12,
              zIndex: 1,
            }}
          >
            Not-Verified
          </Text>
        </View>

        <Text
          style={{ color: theme === "dark" ? "white" : "black", marginTop: 10 }}
        >
          Date of Birth
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>
          {user?.dob || "User Date of Birth"}
        </Text>

        <Text
          style={{ color: theme === "dark" ? "white" : "black", marginTop: 10 }}
        >
          Gender
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>
          {user?.gender || "User Gender"}
        </Text>

        <Text
          style={{ color: theme === "dark" ? "white" : "black", marginTop: 10 }}
        >
          Phone
        </Text>
        <Text style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}>
          {user?.phoneNumber || "User Phone"}
        </Text>

        {(user?.role === "landlord" || user?.role === "propertyManager") &&
          user.nin && (
            <>
              <Text
                style={{
                  color: theme === "dark" ? "white" : "black",
                  marginTop: 10,
                }}
              >
                NIN
              </Text>
              <Text
                style={{ color: colors.textMuted, marginTop: 5, fontSize: 16 }}
              >
                {user?.nin || "User NIN"}
              </Text>
            </>
          )}
      </View>

      {/* Security */}
      <Text
        style={{
          color: "lightgrey",
          fontSize: 20,
          fontWeight: "bold",
          marginVertical: 10,
        }}
      >
        Security
      </Text>
      <View
        style={{
          width: "100%",
          borderRadius: 8,
          backgroundColor: colors.card,
          padding: 10,
        }}
      >
        <Text style={{ color: colors.text, fontSize: 20, fontWeight: "bold" }}>
          Change Password
        </Text>
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
          ]}
          placeholder="Enter old-password"
          placeholderTextColor={colors.textMuted}
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
          ]}
          placeholder="Enter new-password"
          placeholderTextColor={colors.textMuted}
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          autoCapitalize="none"
        />
        <TextInput
          style={[
            styles.input,
            { backgroundColor: colors.background, color: colors.text },
          ]}
          placeholder="confirm-password"
          placeholderTextColor={colors.textMuted}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: colors.bg,
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
          onPress={handleChangePassword}
          disabled={isChangingPassword}
        >
          {isChangingPassword ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={{ color: "white", fontWeight: "bold" }}>
              Update Password
            </Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Delete account */}
      <Text
        style={{
          color: "lightpink",
          fontSize: 20,
          fontWeight: "bold",
          marginVertical: 10,
        }}
      >
        Danger Zone
      </Text>
      <View
        style={{
          width: "100%",
          borderRadius: 8,
          backgroundColor: "lightpink",
          padding: 10,
        }}
      >
        <Text style={{ color: "crimson", fontSize: 20, fontWeight: "bold" }}>
          Delete Account
        </Text>

        <Text style={{ color: "crimson", marginTop: 10 }}>
          Once you delete your account, there is no going back. Please be
          certain.
          <Text style={{ fontWeight: "bold" }}>
            This action is irreversible!
          </Text>
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 10,
            backgroundColor: "crimson",
            padding: 10,
            borderRadius: 8,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
          onPress={() => setIsDeleteModalVisible(true)}
          disabled={isDeleting}
        >
          <Text style={{ color: "pink", fontWeight: "bold" }}>
            {isDeleting ? "Deleting..." : "Delete Account"}
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity
        style={{
          marginTop: 20,
          backgroundColor: colors.primary,
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
        }}
        onPress={logout}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>
          Sign out {user?.username ? `(${user.username})` : ""}
        </Text>
      </TouchableOpacity>
      <View style={{ height: 40 }} />

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
    padding: 10,
  },
  sectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 10,
  },
  iconButton: {
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    padding: 3,
    paddingHorizontal: 4,
    gap: 2,
    position: "absolute",
    top: 10,
    right: 10,
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
    height: 40,
    borderRadius: 8,
    marginVertical: 10,
    paddingHorizontal: 6,
  },
  warningContainer: {
    alignItems: "center",
    marginVertical: 10,
    padding: 10,
    backgroundColor: "rgba(255, 0, 0, 0.1)",
    borderRadius: 8,
  },
  warningText: {
    color: "red",
    fontSize: 14,
    textAlign: "center",
  },
});

export default AccountScreen;
