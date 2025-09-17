import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Modal,
  Animated,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import ProfileEditForm from "../components/ProfileEditForm";

const SettingsScreen = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleSaveProfile = (profileData) => {
    // Handle saving profile data here
    console.log("Profile data to save:", profileData);
    // You would typically send this data to your backend or store it locally
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={{
          position: "relative",
          flex: 1,
          backgroundColor: colors.background,
          width: "100%",
        }}
      >
        <View
          style={{
            backgroundColor: colors.bg,
            height: 400,
            width: "100%",
            borderBottomLeftRadius: 300,
            borderBottomRightRadius: 130,
          }}
        ></View>
        {/* Main content Container */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 1,
            backgroundColor: "transparent",
            flex: 1,
            paddingHorizontal: 10,
            // justifyContent: "center",
            alignItems: "center",
            paddingVertical: 10,
          }}
        >
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
          <View
            style={{
              width: "100%",
              height: 380,
              backgroundColor: "transparent",
              justifyContent: "center",
              alignItems: "center",
              marginVertical: 10,
              borderRadius: 20,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                padding: 10,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={[
                  styles.buttonText,
                  {
                    color: theme === "dark" ? "White" : "white",

                    fontSize: 30,

                    fontWeight: "bold",
                    textShadowColor: "rgba(0, 0, 0, 0.75)",
                    textShadowOffset: { width: -1, height: 1 },
                    textShadowRadius: 10,

                    textAlign: "center",
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
            <Image
              source={{
                uri: "https://www.shutterstock.com/image-vector/default-avatar-photo-placeholder-grey-600nw-2007531536.jpg",
              }}
              style={{ width: 250, height: 250, borderRadius: 150, top: 0 }}
            />
            <Text
              style={{
                color: colors.text,
                fontWeight: "bold",
                fontSize: 35,
                marginTop: 5,
              }}
            >
              @UserName
            </Text>
            <Text
              style={{ color: colors.text, fontWeight: "400", fontSize: 20 }}
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
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
  },
  themeButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    width: "100%",
    elevation: 3,
    marginVertical: 2,
  },
  btns: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    width: "100%",
    elevation: 3,
    marginVertical: 5,
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
