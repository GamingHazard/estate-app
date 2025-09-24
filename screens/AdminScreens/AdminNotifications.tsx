import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const mockNotifications = [
  {
    id: '1',
    title: 'New Property Request',
    message: 'A new property has been submitted for review',
    timestamp: '2 hours ago',
    type: 'review',
    read: false,
  },
  {
    id: '2',
    title: 'System Update',
    message: 'New features have been added to the admin dashboard',
    timestamp: '1 day ago',
    type: 'system',
    read: true,
  },
  // Add more mock notifications as needed
];

export function AdminNotifications() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    notificationItem: {
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    unreadNotification: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    message: {
      fontSize: 14,
      color: colors.textMuted,
      marginBottom: 8,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    timestamp: {
      fontSize: 12,
      color: colors.textMuted,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    actionText: {
      fontSize: 12,
      color: colors.primary,
      marginLeft: 4,
    },
  });

  const renderNotification = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.notificationItem,
        !item.read && styles.unreadNotification,
      ]}
    >
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.message}>{item.message}</Text>
      <View style={styles.footer}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        <TouchableOpacity style={styles.actionButton}>
          <MaterialIcons name="chevron-right" size={16} color={colors.primary} />
          <Text style={styles.actionText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
      <FlatList
        style={[styles.container, { backgroundColor: colors.background }]}
        data={mockNotifications}
        renderItem={renderNotification}
        keyExtractor={(item) => item.id}
      />
  );
}