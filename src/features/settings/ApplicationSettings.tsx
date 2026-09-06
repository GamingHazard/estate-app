import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";

const ApplicationSettings: React.FC = () => {
  const { colors, theme, toggleTheme } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(theme === "dark");
  const [locationEnabled, setLocationEnabled] = useState(false);

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <Text style={[styles.header, { color: colors.text }]}>
        General App Settings
      </Text>
      {/* Notifications Switch */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>
          Enable Notifications
        </Text>
        <Switch
          value={notificationsEnabled}
          onValueChange={setNotificationsEnabled}
          trackColor={{
            false: `${colors.textMuted}55`,
            true: `${colors.primary}55`,
          }}
          thumbColor={notificationsEnabled ? colors.primary : colors.background}
        />
      </View>
      {/* Theme Switch */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Dark Mode</Text>
        <Switch
          value={darkModeEnabled}
          onValueChange={() => {
            setDarkModeEnabled(!darkModeEnabled);
            toggleTheme();
          }}
          trackColor={{
            false: `${colors.textMuted}55`,
            true: `${colors.primary}55`,
          }}
          thumbColor={darkModeEnabled ? colors.primary : colors.card}
        />
      </View>

      {/* Location Switch */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>
          Location Access
        </Text>
        <Switch
          value={locationEnabled}
          onValueChange={setLocationEnabled}
          trackColor={{
            false: `${colors.textMuted}55`,
            true: `${colors.primary}55`,
          }}
          thumbColor={locationEnabled ? colors.primary : colors.background}
        />
      </View>

      {/* Language Selection */}
      <View style={styles.section}>
        <Text style={[styles.label, { color: colors.text }]}>Language</Text>
        <TouchableOpacity
          style={[styles.languageButton, { backgroundColor: colors.card }]}
        >
          <Text style={{ color: colors.text }}>English</Text>
        </TouchableOpacity>
      </View>
      {/* App permissions  */}
      <View
        style={{
          width: "100%",
          borderRadius: 8,
          backgroundColor: colors.card,
          padding: 10,
          marginVertical: 10,
        }}
      >
        <Text
          style={{ color: colors.textMuted, fontSize: 20, fontWeight: "bold" }}
        >
          App Permissions
        </Text>

        <Text style={{ color: "green", marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Camera:</Text>
          granted
        </Text>
        <Text
          style={{
            color: locationEnabled ? "green" : "crimson",
            marginTop: 10,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Location:</Text>

          {locationEnabled ? "granted" : "denied"}
        </Text>
        <Text
          style={{
            color: notificationsEnabled ? "green" : "crimson",
            marginTop: 10,
          }}
        >
          <Text style={{ fontWeight: "bold" }}>Notifications:</Text>

          {notificationsEnabled ? "granted" : "denied"}
        </Text>
        <Text style={{ color: "green", marginTop: 10 }}>
          <Text style={{ fontWeight: "bold" }}>Storage:</Text>
          granted
        </Text>
      </View>

      <View style={{}}>
        <Text style={[styles.label, { color: colors.text }]}>About</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Name:</Text>
          Estate App v1.0.
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Version:</Text>
          1.0.0
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Android :</Text>
          8+
        </Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          <Text style={{ fontWeight: "bold" }}>Status :</Text>
          Outdated
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  section: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#eee",
    borderRadius: 8,
  },
});

export default ApplicationSettings;
