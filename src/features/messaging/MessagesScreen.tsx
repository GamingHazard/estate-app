import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "../../shared/theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../auth/AuthContext";
import {
  archiveConversation,
  createMessagingSocket,
  getConversations,
  markConversationRead,
  ServerConversation,
} from "./messagingApi";

const MessagesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ServerConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const { user, openAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    let active = true;
    getConversations()
      .then(({ conversations }) => {
        if (active) setMessages(conversations);
      })
      .catch((error) => console.error("Unable to load conversations:", error));

    let socket: Awaited<ReturnType<typeof createMessagingSocket>>;
    void createMessagingSocket().then((connectedSocket) => {
      socket = connectedSocket;
      socket.on("conversation:updated", () => {
        void getConversations()
          .then(({ conversations }) => active && setMessages(conversations))
          .catch((error) =>
            console.error("Unable to refresh conversations:", error),
          );
      });
    });

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [user]);

  const closeActionBar = () => setSelectedChatId(null);

  const markSelectedRead = () => {
    if (!selectedChatId) return;
    void markConversationRead(selectedChatId).catch((error) =>
      console.error("Unable to mark conversation read:", error),
    );
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
    const conversationId = selectedChatId;
    void archiveConversation(conversationId).catch((error) =>
      console.error("Unable to archive conversation:", error),
    );
    setMessages((current) =>
      current.filter((message) => message.id !== conversationId),
    );
    closeActionBar();
  };

  const deleteSelected = () => {
    if (!selectedChatId) return;
    const conversationId = selectedChatId;
    void archiveConversation(conversationId).catch((error) =>
      console.error("Unable to remove conversation:", error),
    );
    setMessages((current) =>
      current.filter((message) => message.id !== conversationId),
    );
    closeActionBar();
  };

  const markAllAsRead = () => {
    void Promise.all(
      messages.map((message) => markConversationRead(message.id)),
    ).catch((error) =>
      console.error("Unable to mark conversations read:", error),
    );
    const updatedMessages = messages.map((msg) => ({
      ...msg,
      unread: false,
      unreadCount: 0,
    }));
    setMessages(updatedMessages);
  };

  const renderMessage = ({ item }: { item: ServerConversation }) => {
    const participant =
      item.participants.find((candidate) => String(candidate._id) !== String(user?.id)) ||
      item.participants[0];
    const sender = [participant?.firstName, participant?.lastName]
      .filter(Boolean)
      .join(" ") || "Property owner";
    const avatar = participant?.avatar?.url || "";
    const preview = item.lastMessage?.deleted
      ? "This message was deleted."
      : item.lastMessage?.text || "Start a conversation";
    const timestamp = item.lastMessageAt
      ? new Date(item.lastMessageAt).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";

    return (
    <TouchableOpacity
      style={[
        styles.messageItem,
        { backgroundColor: colors.card, borderColor: colors.border },
        selectedChatId === item.id && styles.selectedMessageItem,
        selectedChatId === item.id && { borderColor: colors.primary },
      ]}
      delayLongPress={500}
      onLongPress={() => {
        if (!user) {
          openAuth();
          return;
        }
        setSelectedChatId((current) =>
          current === item.id ? null : item.id,
        );
      }}
      onPress={() => {
        if (!user) {
          openAuth();
          return;
        }
        if (selectedChatId) {
          setSelectedChatId((current) =>
            current === item.id ? null : item.id,
          );
          return;
        }
        setMessages((current) =>
          current.map((message) =>
            message.id === item.id
              ? { ...message, unread: false, unreadCount: 0 }
              : message,
          ),
        );
        void markConversationRead(item.id).catch((error) =>
          console.error("Unable to mark conversation read:", error),
        );
        navigation.navigate("Chat Room", {
          conversationId: item.id,
          participantName: sender,
          participantAvatar: avatar,
          initialMessages: [],
        });
      }}
    >
      <Image source={{ uri: avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={[styles.sender, { color: colors.text }]}>
          {sender}
        </Text>
        <Text
          style={[styles.messageText, { color: colors.textMuted }]}
          numberOfLines={1}
        >
          {preview}
        </Text>
      </View>
      <View style={styles.messageInfo}>
        <Text
          style={[
            styles.timestamp,
            { color: colors.textMuted },
            item.unreadCount > 0 && [
              styles.unreadTimestamp,
              { color: colors.primary, textShadowColor: colors.primary },
            ],
          ]}
        >
          {timestamp}
        </Text>
        {item.unreadCount > 0 ? (
          <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
            <Text style={styles.unreadBadgeText}>
              {item.unreadCount > 99 ? "99+" : item.unreadCount}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border },
        ]}
      >
        {selectedChatId ? (
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
          </>
        ) : (
          <>
            <Text style={[styles.headerText, { color: colors.text }]}>
              Messages
            </Text>
            <TouchableOpacity onPress={markAllAsRead}>
              <Text style={styles.readAllButton}>Read All</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {messages.length > 0 ? (
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbox-outline" size={80} color={colors.text} />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No Messages
          </Text>
          <Text style={[styles.emptySubText, { color: colors.text }]}>
            Your message inbox is empty.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
  },
  readAllButton: {
    color: "#007BFF",
    fontWeight: "bold",
  },
  messageList: {
    padding: 16,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  selectedMessageItem: {
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
  sender: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: "gray",
  },
  messageInfo: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  unreadTimestamp: {
    fontWeight: "700",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  headerActionButton: {
    minWidth: 54,
    alignItems: "center",
    gap: 3,
  },
  headerActionLabel: {
    fontSize: 11,
    fontWeight: "700",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 20,
  },
  emptySubText: {
    fontSize: 16,
    color: "gray",
    marginTop: 10,
  },
});

export default MessagesScreen;
