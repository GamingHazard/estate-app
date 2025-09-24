import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';
import SwitchToggle from 'react-native-switch-toggle';

export function AdminSettings() {
  const { colors, theme } = useTheme();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
    },
    settingItem: {
      backgroundColor: colors.card,
      padding: 16,
      borderRadius: 8,
      marginBottom: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: colors.border,
    },
    settingLabel: {
      fontSize: 16,
      color: colors.text,
    },
    settingDescription: {
      fontSize: 14,
      color: colors.textMuted,
      marginTop: 4,
    },
  });

  const switchStyle = {
    width: 50,
    height: 25,
    borderRadius: 25,
    padding: 2,
  };

  const circleStyle = {
    width: 21,
    height: 21,
    borderRadius: 21,
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>General</Text>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Email Notifications</Text>
            <Text style={styles.settingDescription}>Receive email alerts for new properties</Text>
          </View>
          <SwitchToggle
            switchOn={emailNotifications}
            onPress={() => setEmailNotifications(!emailNotifications)}
            containerStyle={switchStyle}
            circleStyle={circleStyle}
            circleColorOff={colors.background}
            circleColorOn={colors.primary}
            backgroundColorOn={`${colors.primary}55`}
            backgroundColorOff={`${colors.textMuted}55`}
          />
        </View>
        <View style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Push Notifications</Text>
            <Text style={styles.settingDescription}>Enable push notifications</Text>
          </View>
          <SwitchToggle
            switchOn={pushNotifications}
            onPress={() => setPushNotifications(!pushNotifications)}
            containerStyle={switchStyle}
            circleStyle={circleStyle}
            circleColorOff={colors.background}
            circleColorOn={colors.primary}
            backgroundColorOn={`${colors.primary}55`}
            backgroundColorOff={`${colors.textMuted}55`}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Security</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Change Password</Text>
            <Text style={styles.settingDescription}>Update your admin password</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Two-Factor Authentication</Text>
            <Text style={styles.settingDescription}>Add an extra layer of security</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data Management</Text>
        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Export Data</Text>
            <Text style={styles.settingDescription}>Download property and user data</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.settingItem}>
          <View>
            <Text style={styles.settingLabel}>Backup Settings</Text>
            <Text style={styles.settingDescription}>Configure automatic backups</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}