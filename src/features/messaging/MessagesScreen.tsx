import React, { useEffect, useState } from "react";
import {
  Alert,
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
  createMessagingSocket,
  getOrCreateSupportConversation,
  getConversations,
  hideConversation,
  markConversationRead,
  restoreConversation,
  ServerConversation,
} from "./messagingApi";

const MessagesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState<ServerConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [showArchived, setShowArchived] = useState(false);
  const { user, openAuth } = useAuth();

  useEffect(() => {
    if (!user) {
      setMessages([]);
      return;
    }

    let active = true;
    getConversations(showArchived)
      .then(({ conversations }) => {
        if (active) setMessages(conversations);
      })
      .catch((error) => {
        console.error("Unable to load conversations:", error);
        if (active) Alert.alert("Unable to load messages", "Please try again.");
      });

    let socket: Awaited<ReturnType<typeof createMessagingSocket>>;
    void createMessagingSocket()
      .then((connectedSocket) => {
        if (!active) {
          connectedSocket.disconnect();
          return;
        }
        socket = connectedSocket;
        socket.on("conversation:updated", () => {
          void getConversations(showArchived)
            .then(({ conversations }) => active && setMessages(conversations))
            .catch((error) =>
              console.error("Unable to refresh conversations:", error),
            );
        });
      })
      .catch((error) =>
        console.error("Unable to connect messaging updates:", error),
      );

    return () => {
      active = false;
      socket?.disconnect();
    };
  }, [user, showArchived]);

  const openSupportConversation = async () => {
    if (!user) {
      openAuth();
      return;
    }
    try {
      const { conversation } = await getOrCreateSupportConversation();
      await restoreConversation(conversation.id);
      navigation.navigate("Chat Room", {
        conversationId: conversation.id,
        participantName: "Estate support",
        participantAvatar: "",
        initialMessages: [],
      });
    } catch (error) {
      console.error("Unable to open support conversation:", error);
      Alert.alert("Unable to contact support", "Please try again.");
    }
  };

  const closeActionBar = () => setSelectedChatId(null);

  const markSelectedRead = () => {
    if (!selectedChatId) return;
    void markConversationRead(selectedChatId)
      .then(() =>
        setMessages((current) =>
          current.map((message) =>
            message.id === selectedChatId
              ? { ...message, unreadCount: 0 }
              : message,
          ),
        ),
      )
      .catch((error) => {
        console.error("Unable to mark conversation read:", error);
        Alert.alert("Unable to update messages", "Please try again.");
      });
    closeActionBar();
  };

  const archiveSelected = async () => {
    if (!selectedChatId) return;
    const conversationId = selectedChatId;
    try {
      await hideConversation(conversationId);
      setMessages((current) =>
        current.filter((message) => message.id !== conversationId),
      );
      closeActionBar();
    } catch (error) {
      console.error("Unable to archive conversation:", error);
      Alert.alert("Unable to archive conversation", "Please try again.");
    }
  };

  const markAllAsRead = () => {
    void Promise.all(
      messages.map((message) => markConversationRead(message.id)),
    )
      .then(() =>
        setMessages((current) =>
          current.map((message) => ({ ...message, unreadCount: 0 })),
        ),
      )
      .catch((error) => {
        console.error("Unable to mark conversations read:", error);
        Alert.alert("Unable to update messages", "Please try again.");
      });
  };

  const renderMessage = ({ item }: { item: ServerConversation }) => {
    const participant =
      item.participants.find((candidate) => String(candidate._id) !== String(user?.id)) ||
      item.participants[0];
    const sender = item.type === "support"
      ? "Estate support"
      : [participant?.firstName, participant?.lastName]
          .filter(Boolean)
          .join(" ") || "Property owner";
    const avatar = participant?.avatar?.url || "";
    const preview = item.lastMessage?.deleted
      ? "This message was deleted."
      : item.lastMessage?.text ||
        item.lastMessage?.attachment?.fileName ||
        "Start a conversation";
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
        void restoreConversation(item.id)
          .then(() => {
            setMessages((current) =>
              current.map((message) =>
                message.id === item.id
                  ? { ...message, unreadCount: 0 }
                  : message,
              ),
            );
            navigation.navigate("Chat Room", {
              conversationId: item.id,
              participantName: sender,
              participantAvatar: avatar,
              initialMessages: [],
            });
          })
          .catch((error) => {
            console.error("Unable to open conversation:", error);
            Alert.alert("Unable to open conversation", "Please try again.");
          });
      }}
    >
      {avatar ? (
        <Image source={{ uri: avatar }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
          <Ionicons
            name={item.type === "support" ? "help-circle-outline" : "person-outline"}
            size={24}
            color={colors.textMuted}
          />
        </View>
      )}
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
            <TouchableOpacity style={styles.headerActionButton} onPress={markSelectedRead}>
              <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
              <Text style={[styles.headerActionLabel, { color: colors.primary }]}>Read all</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerActionButton} onPress={archiveSelected}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              <Text style={[styles.headerActionLabel, { color: colors.destructive }]}>Hide</Text>
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
            <View style={styles.headerActions}>
              <TouchableOpacity onPress={() => setShowArchived((value) => !value)}>
                <Text style={styles.readAllButton}>
                  {showArchived ? "Inbox" : "Archived"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={openSupportConversation}>
                <Text style={styles.readAllButton}>Contact support</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.readAllButton}>Read All</Text>
              </TouchableOpacity>
            </View>
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
            {showArchived ? "Your archive is empty." : "Your message inbox is empty."}
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
  headerActions: {
    flexDirection: "row",
    gap: 16,
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
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
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
