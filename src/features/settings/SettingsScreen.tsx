import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
  Pressable,
  Animated,
} from "react-native";
import { useInternetConnection } from "../../shared/hooks/useInternetConnection";
import { useTheme } from "../../shared/theme/ThemeContext";
import { useAuth } from "../auth/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { apiRequest, uploadRequest } from "../../shared/queryClient";

const SettingsScreen = ({ navigation }: { navigation: any }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const { user, openAuth, updateUser } = useAuth();
  const [profileImage, setProfileImage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const isAvatarBusy = isUploadingImage || isRemovingAvatar;
  const isConnected = useInternetConnection();
  const isDarkMode = theme === "dark";
  const knobPosition = useRef(new Animated.Value(isDarkMode ? 30 : 0)).current;

  useEffect(() => {
    Animated.spring(knobPosition, {
      toValue: isDarkMode ? 30 : 0,
      useNativeDriver: true,
      tension: 140,
      friction: 12,
    }).start();
  }, [isDarkMode, knobPosition]);

  useEffect(() => {
    (async () => {
      const cameraStatus = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus.status !== "granted") {
        Alert.alert("Sorry, we need camera permissions to make this work!");
      }

      const galleryStatus =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (galleryStatus.status !== "granted") {
        Alert.alert(
          "Sorry, we need camera roll permissions to make this work!",
        );
      }
    })();
  }, []);

  const uploadProfileImage = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!user) {
      openAuth();
      return;
    }

    setProfileImage(asset.uri);
    setIsUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append("avatar", {
        uri: asset.uri,
        name: asset.fileName || "profile-image.jpg",
        type: asset.mimeType || "image/jpeg",
      } as any);

      const result = await uploadRequest("PATCH", "/users/me/avatar", formData);

      if (!result?.success || !result.user) {
        throw new Error(result?.message || "Unable to save profile image");
      }

      await updateUser(result.user);
      setProfileImage(result.user.avatar?.url || asset.uri);
      Alert.alert("Profile image updated", "Your profile image was saved.");
    } catch (error) {
      setProfileImage(user.avatar?.url || "");
      Alert.alert(
        "Upload failed",
        error instanceof Error
          ? error.message
          : "Unable to upload profile image",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };

  const chooseProfileImageSource = () => {
    Alert.alert("Change profile photo", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            await uploadProfileImage(result.assets[0]);
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            await uploadProfileImage(result.assets[0]);
          }
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleImageUpload = () => {
    const actions: Parameters<typeof Alert.alert>[2] = [
      {
        text: "Change photo",
        onPress: chooseProfileImageSource,
      },
    ];

    if (user?.avatar?.url || user?.avatar?.publicId) {
      actions.push({
        text: "Remove profile photo",
        style: "destructive",
        onPress: () => {
          Alert.alert(
            "Remove profile photo?",
            "Your uploaded photo will be removed. Your default avatar will be shown instead.",
            [
              { text: "Keep photo", style: "cancel" },
              {
                text: "Remove photo",
                style: "destructive",
                onPress: () => void removeProfileImage(),
              },
            ],
          );
        },
      });
    }

    actions.push({ text: "Cancel", style: "cancel" });

    Alert.alert("Profile photo", "Manage your profile photo", actions);
  };

  const removeProfileImage = async () => {
    if (!user || isAvatarBusy) return;

    setIsRemovingAvatar(true);
    try {
      const response = await apiRequest("DELETE", "/users/me/avatar");
      const result = await response.json();

      if (!result?.success || !result.user) {
        throw new Error(result?.message || "Unable to remove profile photo");
      }

      await updateUser(result.user);
      setProfileImage("");
    } catch (error) {
      Alert.alert(
        "Unable to remove profile photo",
        error instanceof Error ? error.message : "Please try again.",
      );
    } finally {
      setIsRemovingAvatar(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.scrollContainer}
    >
      <View
        style={[
          styles.backgroundShape,
          {
            backgroundColor: colors.bg,
          },
        ]}
      />
      {/* Main content Container */}
      <View style={styles.contentContainer}>
        <View style={[styles.themeToggleCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <View style={styles.themeToggleRow}>
            <View style={styles.themeToggleTextWrap}>
              <Text style={[styles.themeToggleLabel, { color: colors.text }]}>
                Appearance
              </Text>
              <Text style={[styles.themeToggleHint, { color: colors.textMuted }]}>
                {isDarkMode ? "Dark mode enabled" : "Light mode enabled"}
              </Text>
            </View>

            <Pressable
              accessibilityRole="switch"
              accessibilityState={{ checked: isDarkMode }}
              onPress={toggleTheme}
              style={[
                styles.switchTrack,
                {
                  backgroundColor: isDarkMode ? "#1F2937" : "#E5E7EB",
                  borderColor: isDarkMode ? "#374151" : "#D1D5DB",
                },
              ]}
            >
              <Animated.View
                style={[
                  styles.switchKnob,
                  {
                    backgroundColor: isDarkMode ? "#F8FAFC" : "#FFFFFF",
                    transform: [{ translateX: knobPosition }],
                  },
                ]}
              >
                <Ionicons
                  name={isDarkMode ? "moon" : "sunny"}
                  size={16}
                  color={isDarkMode ? "#111827" : "#F59E0B"}
                />
              </Animated.View>
            </Pressable>
          </View>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            {/* <Text
              style={[
                styles.profileTitle,
                {
                  color: theme === "dark" ? "white" : "white",
                },
              ]}
            >
              Profile
            </Text> */}
            {/* <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Ionicons
                name={theme === "dark" ? "pencil" : "pencil-outline"}
                size={24}
                color="white"
              />
            </TouchableOpacity> */}
          </View>
          <View style={styles.avatarContainer}>
            {profileImage || user?.avatar?.url ? (
              <Image
                source={{ uri: profileImage || user?.avatar?.url }}
                style={styles.profileImage}
              />
            ) : user?.gender === "female" ? (
              <Image
                source={require("../../../assets/female 2.webp")}
                style={styles.profileImage}
              />
            ) : user?.gender === "male" ? (
              <Image
                source={require("../../../assets/male.png")}
                style={styles.profileImage}
              />
            ) : (
              <View
                accessibilityLabel="Default profile avatar"
                style={[styles.unknownAvatar, { backgroundColor: colors.card }]}
              >
                <Ionicons name="person" size={120} color={colors.textMuted} />
              </View>
            )}
            {isAvatarBusy && (
              <View style={styles.uploadOverlay}>
                <ActivityIndicator size="small" color="white" />
              </View>
            )}
            {user ? (
              <TouchableOpacity
                style={styles.uploadIcon}
                onPress={handleImageUpload}
                disabled={isAvatarBusy}
              >
                <Ionicons
                  name={isAvatarBusy ? "cloud-upload" : "camera"}
                  size={24}
                  color="white"
                />
              </TouchableOpacity>
            ) : (
              ""
            )}
          </View>
          <Text
            style={[
              styles.profileUsername,
              {
                color: colors.text,
              },
            ]}
          >
            {user ? `${user?.firstName} ${user?.lastName}` : "Guest User"}
          </Text>
          <Text
            style={[
              styles.profileEmail,
              {
                color: colors.text,
              },
            ]}
          >
            {user ? user?.email : "Not logged in"}
          </Text>
        </View>

        {/* Btns */}

        {/* Account Btn */}
        <TouchableOpacity
          style={[
            styles.btns,
            {
              backgroundColor: colors.card,
              borderTopLeftRadius: 15,
              borderTopRightRadius: 15,
            },
          ]}
          onPress={() => {
            if (!user) {
              openAuth();
              return;
            }
            navigation.navigate("Account");
          }}
        >
          <Ionicons
            name={theme === "dark" ? "person" : "person-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Account
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* App Settings Btn */}
        <TouchableOpacity
          style={[
            styles.btns,
            {
              backgroundColor: colors.card,
            },
          ]}
          onPress={() => navigation.navigate("General settings")} // Navigate to App Settings screen
        >
          <Ionicons
            name={theme === "dark" ? "settings" : "settings-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            General Settings
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* Customer Care Btn */}
        <TouchableOpacity
          style={[styles.btns, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("Customer Care")} // Navigate to Customer Care screen
        >
          <Ionicons
            name={theme === "dark" ? "help-circle" : "help-circle-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Customer Care
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* History Btn */}
        <TouchableOpacity
          style={[styles.btns, { backgroundColor: colors.card }]}
          onPress={() => navigation.navigate("History")} // Navigate to History screen
        >
          <Ionicons
            name={theme === "dark" ? "hourglass" : "hourglass-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            History
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>

        {/* User Manual Btn */}
        <TouchableOpacity
          style={[
            styles.btns,
            {
              backgroundColor: colors.card,
              borderBottomLeftRadius: 15,
              borderBottomRightRadius: 15,
            },
          ]}
          onPress={() => navigation.navigate("User Guide")} // Navigate to User Manual screen
        >
          <Ionicons
            name={theme === "dark" ? "document-text" : "document-text-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text
            style={[
              styles.buttonText,
              {
                color: colors.text,
              },
            ]}
          >
            User Guide
          </Text>
          <Ionicons
            name="chevron-forward"
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
        </TouchableOpacity>
        <View style={{ height: 60 }} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20,
    position: "relative",
  },
  backgroundShape: {
    height: 400,
    width: "100%",
    borderBottomLeftRadius: 300,
    borderBottomRightRadius: 130,
    position: "absolute",
    top: 0,
  },
  contentContainer: {
    width: "100%",
    paddingHorizontal: 10,
    alignItems: "center",
    paddingVertical: 10,
    marginTop: 20,
  },
  themeToggleCard: {
    width: "100%",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 8,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  themeToggleRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  themeToggleTextWrap: {
    flex: 1,
  },
  themeToggleLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  themeToggleHint: {
    fontSize: 12,
    marginTop: 2,
  },
  switchTrack: {
    width: 72,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 4,
    justifyContent: "center",
    borderWidth: 1,
  },
  switchKnob: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 4,
  },
  profileSection: {
    marginTop: 60,
    width: "100%",
    backgroundColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 10,
    borderRadius: 20,
  },
  profileHeader: {
    flexDirection: "row",
    width: "100%",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  profileTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
    textAlign: "center",
    marginRight: 10,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
    backgroundColor: "white",
    borderRadius: 150,
  },
  uploadOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 150,
    backgroundColor: "rgba(0, 0, 0, 0.62)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  uploadIcon: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 50,
  },
  profileImage: {
    width: 250,
    height: 250,
    borderRadius: 150,
  },
  unknownAvatar: {
    width: 250,
    height: 250,
    borderRadius: 150,
    alignItems: "center",
    justifyContent: "center",
  },
  profileUsername: {
    fontWeight: "bold",
    fontSize: 35,
  },
  profileEmail: {
    fontWeight: "400",
    fontSize: 20,
  },
  btns: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    width: "100%",
    elevation: 3,
    marginVertical: 2,
    height: 80,
  },
  buttonIcon: {
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
});

export default SettingsScreen;
