import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import ProfileEditForm from "../components/ProfileEditForm";
import * as ImagePicker from "expo-image-picker";

const SettingsScreen = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [profileImage, setProfileImage] = useState(
    "https://www.shutterstock.com/image-vector/default-avatar-photo-placeholder-grey-600nw-2007531536.jpg"
  );

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
          "Sorry, we need camera roll permissions to make this work!"
        );
      }
    })();
  }, []);

  const handleImageUpload = () => {
    Alert.alert("Upload Profile Picture", "Choose an option", [
      {
        text: "Take Photo",
        onPress: async () => {
          let result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Choose from Gallery",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
          });

          if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
          }
        },
      },
      {
        text: "Cancel",
        style: "cancel",
      },
    ]);
  };

  const handleSaveProfile = (profileData) => {
    // Handle saving profile data here
    console.log("Profile data to save:", { ...profileData, profileImage });
    // You would typically send this data to your backend or store it locally
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
        {/* Theme Button */}
        <TouchableOpacity
          style={[styles.themeButton, { backgroundColor: colors.card }]}
          onPress={toggleTheme}
        >
          <Ionicons
            name={theme === "dark" ? "sunny" : "moon"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>
            {theme === "dark" ? "Enable Light Mode" : "Enable Dark Mode"}
          </Text>
        </TouchableOpacity>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileHeader}>
            <Text
              style={[
                styles.profileTitle,
                {
                  color: theme === "dark" ? "white" : "white",
                },
              ]}
            >
              Profile
            </Text>
            <TouchableOpacity onPress={() => setIsModalVisible(true)}>
              <Ionicons
                name={theme === "dark" ? "pencil" : "pencil-outline"}
                size={24}
                color="white"
              />
            </TouchableOpacity>
          </View>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: profileImage,
              }}
              style={styles.profileImage}
            />
            <TouchableOpacity
              style={styles.uploadIcon}
              onPress={handleImageUpload}
            >
              <Ionicons name="camera" size={24} color="white" />
            </TouchableOpacity>
          </View>
          <Text
            style={[
              styles.profileUsername,
              {
                color: colors.text,
              },
            ]}
          >
            @UserName
          </Text>
          <Text
            style={[
              styles.profileEmail,
              {
                color: colors.text,
              },
            ]}
          >
            user@example.com
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
          onPress={() => navigation.navigate("Account")} // Navigate to Account screen
        >
          <Ionicons
            name={theme === "dark" ? "person" : "person-outline"}
            size={24}
            color={colors.text}
            style={styles.buttonIcon}
          />
          <Text style={[styles.buttonText, { color: colors.text }]}>Account</Text>
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
            name={
              theme === "dark" ? "document-text" : "document-text-outline"
            }
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

      {/* Profile Edit Modal */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setIsModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ProfileEditForm
              onClose={() => setIsModalVisible(false)}
              onSave={handleSaveProfile}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingBottom: 20,
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
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    elevation: 3,
    marginVertical: 5,
  },
  profileSection: {
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
    marginBottom: 5,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    height: "80%",
    width: "100%",
  },
});

export default SettingsScreen;
