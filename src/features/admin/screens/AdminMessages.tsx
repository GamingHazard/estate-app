import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
} from "react-native";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { AdminHeaderActionsContext } from "./AdminLayout";
import { useNavigation } from "@react-navigation/native";

const mockMessages = [
  {
    id: "1",
    user: {
      name: "John Doe",
      avatar: "https://i.pravatar.cc/100?img=1",
    },
    message: "Inquiry about the beachfront property",
    timestamp: "2 mins ago",
    unread: true,
    unreadCount: 3,
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      avatar: "https://i.pravatar.cc/100?img=2",
    },
    message: "When can I schedule a viewing?",
    timestamp: "1 hour ago",
    unread: false,
    unreadCount: 0,
  },
  // Add more mock messages as needed
];

export function AdminMessages() {
  const { colors } = useTheme();
  const setHeaderActions = React.useContext(AdminHeaderActionsContext);
  const [messages, setMessages] = useState(mockMessages);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const navigation = useNavigation<any>();

  const closeActionBar = () => setSelectedChatId(null);

  const markSelectedRead = () => {
    if (!selectedChatId) return;
    setMessages((current) =>
      current.map((message) =>
        message.id === selectedChatId
          ? { ...message, unread: false, unreadCount: 0 }
          : message,
      ),
    );
    closeActionBar();
  };

  const archiveSelected = () => {
    if (!selectedChatId) return;
    setMessages((current) =>
      current.filter((message) => message.id !== selectedChatId),
    );
    closeActionBar();
  };

  const deleteSelected = () => {
    if (!selectedChatId) return;
    setMessages((current) =>
      current.filter((message) => message.id !== selectedChatId),
    );
    closeActionBar();
  };

  useEffect(() => {
    if (!selectedChatId) {
      setHeaderActions(null);
      return;
    }

    setHeaderActions(
      <>
        <TouchableOpacity style={styles.headerActionButton} onPress={archiveSelected}>
          <Ionicons name="archive-outline" size={20} color={colors.text} />
          <Text style={styles.headerActionLabel}>Archive</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionButton} onPress={markSelectedRead}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
          <Text style={[styles.headerActionLabel, { color: colors.primary }]}>Read all</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionButton} onPress={deleteSelected}>
          <Ionicons name="trash-outline" size={20} color={colors.destructive} />
          <Text style={[styles.headerActionLabel, { color: colors.destructive }]}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={closeActionBar}
          accessibilityLabel="Close chat actions"
        >
          <Ionicons name="close-outline" size={20} color={colors.textMuted} />
          <Text style={styles.headerActionLabel}>Close</Text>
        </TouchableOpacity>
      </>,
    );

    return () => setHeaderActions(null);
  }, [colors, selectedChatId]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    messageItem: {
      flexDirection: "row",
      backgroundColor: colors.card,
      padding: 16,
      marginBottom: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      alignItems: "flex-start",
    },
    selectedMessageItem: {
      borderColor: colors.primary,
      borderWidth: 2,
      padding: 15,
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
      fontWeight: "600",
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
    },
    unreadTimestamp: {
      color: colors.primary,
      fontWeight: "700",
      textShadowColor: colors.primary,
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 5,
    },
    unreadBadge: {
      minWidth: 22,
      height: 22,
      borderRadius: 11,
      paddingHorizontal: 6,
      marginRight: 8,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.primary,
    },
    unreadBadgeText: {
      color: "#ffffff",
      fontSize: 12,
      fontWeight: "700",
    },
    trailing: {
      alignItems: "center",
      alignSelf: "stretch",
      justifyContent: "space-between",
      marginLeft: 8,
    },
    headerActionButton: {
      minWidth: 54,
      alignItems: "center",
      gap: 3,
    },
    headerActionLabel: {
      fontSize: 11,
      fontWeight: "700",
      color: colors.text,
    },
  });

  const renderMessage = ({ item }: { item: (typeof mockMessages)[number] }) => (
    <TouchableOpacity
      style={[
        styles.messageItem,
        selectedChatId === item.id && styles.selectedMessageItem,
      ]}
      delayLongPress={2000}
      onLongPress={() => setSelectedChatId(item.id)}
      onPress={() => {
        setMessages((current) =>
          current.map((message) =>
            message.id === item.id
              ? { ...message, unread: false, unreadCount: 0 }
              : message,
          ),
        );
        navigation.navigate("Chat Room", {
          participantName: item.user.name,
          participantAvatar: item.user.avatar,
          initialMessages: [
            {
              id: `chat-${item.id}`,
              sender: "other",
              text: item.message,
              timestamp: item.timestamp,
              avatar: item.user.avatar,
            },
          ],
        });
      }}
    >
      <Image source={{ uri: item.user.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={styles.userName}>{item.user.name}</Text>
        <Text style={styles.messageText}>{item.message}</Text>
      </View>
      <View style={styles.trailing}>
        <Text
          style={[
            styles.timestamp,
            item.unreadCount > 0 && styles.unreadTimestamp,
          ]}
        >
          {item.timestamp}
        </Text>
        {item.unreadCount > 0 ? (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        style={[styles.container, { backgroundColor: colors.background }]}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
}
