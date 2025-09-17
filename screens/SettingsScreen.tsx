import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const SettingsScreen = ({ navigation }) => {
  const { colors, theme, toggleTheme } = useTheme();

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
            <Text
              style={[
                styles.buttonText,
                {
                  color: theme === "dark" ? "White" : "white",
                  alignSelf: "center",
                  fontSize: 25,
                },
              ]}
            >
              Profile
            </Text>
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
            onPress={() => navigation.navigate("account")} // Navigate to Account screen
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
            onPress={() => navigation.navigate("app-settings")} // Navigate to App Settings screen
          >
            <Ionicons
              name={theme === "dark" ? "settings" : "settings-outline"}
              size={24}
              color={colors.text}
              style={styles.buttonIcon}
            />
            <Text style={[styles.buttonText, { color: colors.text }]}>
              Settings
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
            onPress={() => navigation.navigate("customer-care")} // Navigate to Customer Care screen
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
            onPress={() => navigation.navigate("history")} // Navigate to History screen
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
            onPress={() => navigation.navigate("manual")} // Navigate to User Manual screen
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
});

export default SettingsScreen;
