import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { MaterialIcons } from '@expo/vector-icons';

const mockMessages = [
  {
    id: '1',
    user: {
      name: 'John Doe',
      avatar: 'https://i.pravatar.cc/100?img=1',
    },
    message: 'Inquiry about the beachfront property',
    timestamp: '2 mins ago',
    unread: true,
  },
  {
    id: '2',
    user: {
      name: 'Jane Smith',
      avatar: 'https://i.pravatar.cc/100?img=2',
    },
    message: 'When can I schedule a viewing?',
    timestamp: '1 hour ago',
    unread: false,
  },
  // Add more mock messages as needed
];

export function AdminMessages() {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    messageItem: {
      flexDirection: 'row',
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: 'center',
    },
    unreadMessage: {
      borderLeftWidth: 4,
      borderLeftColor: colors.primary,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    messageContent: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    messageText: {
      fontSize: 14,
      color: colors.textMuted,
    },
    timestamp: {
      fontSize: 12,
      color: colors.textMuted,
      marginTop: 4,
    },
  });

  const renderMessage = ({ item }) => (
    <TouchableOpacity
      style={[styles.messageItem, item.unread && styles.unreadMessage]}
    >
      <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.messageText}>{item.message}</Text>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={24} color={colors.textMuted} />
    </TouchableOpacity>
  );

  return (
      <FlatList
        style={[  styles.container, { backgroundColor: colors.background }]}
        data={mockMessages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
      />
  );
}