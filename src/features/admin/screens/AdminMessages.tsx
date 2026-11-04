import React, { useCallback, useContext, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../../shared/theme/ThemeContext";
import { useAuth } from "../../auth/AuthContext";
import { AdminHeaderActionsContext } from "./AdminLayout";
import {
  claimSupportConversation,
  createMessagingSocket,
  getConversations,
  hideConversation,
  markConversationRead,
  restoreConversation,
  ServerConversation,
} from "../../messaging/messagingApi";

export function AdminMessages() {
  const { colors } = useTheme();
  const { user } = useAuth();
  const isPlatformAdmin = user?.role === "admin";
  const setHeaderActions = useContext(AdminHeaderActionsContext);
  const [conversations, setConversations] = useState<ServerConversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const navigation = useNavigation<any>();

  const loadConversations = useCallback(async () => {
    const result = await getConversations(showArchived);
    setConversations(result.conversations);
  }, [showArchived]);

  useEffect(() => {
    let active = true;
    let socket: Awaited<ReturnType<typeof createMessagingSocket>> | undefined;
    void loadConversations().catch((error) => {
      console.error("Unable to load admin conversations:", error);
      Alert.alert("Unable to load messages", "Please try again.");
    });
    void createMessagingSocket()
      .then((connectedSocket) => {
        if (!active) {
          connectedSocket.disconnect();
          return;
        }
        socket = connectedSocket;
        socket.on("conversation:updated", () => {
          void loadConversations().catch((error) =>
            console.error("Unable to refresh admin conversations:", error),
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
  }, [loadConversations]);

  const refresh = async () => {
    setRefreshing(true);
    try {
      await loadConversations();
    } catch (error) {
      console.error("Unable to refresh conversations:", error);
      Alert.alert("Unable to refresh messages", "Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  const markSelectedRead = async () => {
    if (!selectedId) return;
    try {
      const selected = conversations.find((item) => item.id === selectedId);
      if (selected?.type === "support" && isPlatformAdmin && !selected.supportAssignee) {
        await claimSupportConversation(selectedId);
      }
      await markConversationRead(selectedId);
      setConversations((current) =>
        current.map((conversation) =>
          conversation.id === selectedId
            ? { ...conversation, unreadCount: 0 }
            : conversation,
        ),
      );
      setSelectedId(null);
    } catch (error) {
      console.error("Unable to mark conversation read:", error);
      Alert.alert("Unable to update messages", "Please try again.");
    }
  };

  const hideSelected = async () => {
    if (!selectedId) return;
    try {
      const selected = conversations.find((item) => item.id === selectedId);
      if (selected?.type === "support" && isPlatformAdmin && !selected.supportAssignee) {
        await claimSupportConversation(selectedId);
      }
      await hideConversation(selectedId);
      setConversations((current) =>
        current.filter((conversation) => conversation.id !== selectedId),
      );
      setSelectedId(null);
    } catch (error) {
      console.error("Unable to hide conversation:", error);
      Alert.alert("Unable to remove conversation", "Please try again.");
    }
  };

  useEffect(() => {
    if (!selectedId) {
      setHeaderActions(null);
      return;
    }
    setHeaderActions(
      <>
        <TouchableOpacity style={styles.headerActionButton} onPress={hideSelected}>
          <Ionicons name="archive-outline" size={20} color={colors.text} />
          <Text style={[styles.headerActionLabel, { color: colors.text }]}>Hide</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerActionButton} onPress={markSelectedRead}>
          <Ionicons name="checkmark-done-outline" size={20} color={colors.primary} />
          <Text style={[styles.headerActionLabel, { color: colors.primary }]}>Read</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.headerActionButton}
          onPress={() => setSelectedId(null)}
          accessibilityLabel="Close chat actions"
        >
          <Ionicons name="close-outline" size={20} color={colors.textMuted} />
          <Text style={[styles.headerActionLabel, { color: colors.textMuted }]}>Close</Text>
        </TouchableOpacity>
      </>,
    );
    return () => setHeaderActions(null);
  }, [colors, selectedId, setHeaderActions]);

  const openConversation = async (item: ServerConversation) => {
    try {
      let conversation = item;
      if (item.type === "support" && isPlatformAdmin) {
        const claimed = await claimSupportConversation(item.id);
        conversation = claimed.conversation;
      } else {
        await restoreConversation(item.id);
      }
      const peer = conversation.participants.find(
        (participant) => String(participant._id) !== String(user?.id),
      );
      const isSupport = conversation.type === "support";
      navigation.navigate("Chat Room", {
        conversationId: conversation.id,
        participantName: isSupport
          ? isPlatformAdmin
            ? [peer?.firstName, peer?.lastName].filter(Boolean).join(" ") || "Support user"
            : "Estate support"
          : [peer?.firstName, peer?.lastName].filter(Boolean).join(" ") || "Property contact",
        participantAvatar: peer?.avatar?.url || "",
        initialMessages: [],
      });
    } catch (error) {
      console.error("Unable to open admin conversation:", error);
      Alert.alert("Unable to open conversation", "Please try again.");
    }
  };

  const renderConversation = ({ item }: { item: ServerConversation }) => {
    const peer = item.participants.find(
      (participant) => String(participant._id) !== String(user?.id),
    ) || item.participants[0];
    const isSupport = item.type === "support";
    const name = isSupport
      ? isPlatformAdmin
        ? [peer?.firstName, peer?.lastName].filter(Boolean).join(" ") || "Support user"
        : "Estate support"
      : [peer?.firstName, peer?.lastName].filter(Boolean).join(" ") || "Property contact";
    const preview = item.lastMessage?.deleted
      ? "This message was deleted."
      : item.lastMessage?.text ||
        item.lastMessage?.attachment?.fileName ||
        (isSupport ? "Support request" : "Start a conversation");
    const avatar = peer?.avatar?.url || "";

    return (
      <TouchableOpacity
        style={[
          styles.messageItem,
          { backgroundColor: colors.card, borderColor: colors.border },
          selectedId === item.id && { borderColor: colors.primary, borderWidth: 2 },
        ]}
        delayLongPress={500}
        onLongPress={() =>
          setSelectedId((current) => current === item.id ? null : item.id)
        }
        onPress={() => {
          if (selectedId) {
            setSelectedId((current) => current === item.id ? null : item.id);
            return;
          }
          void openConversation(item);
        }}
      >
        {avatar ? (
          <Image source={{ uri: avatar }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: colors.border }]}>
            <Ionicons name={isSupport ? "help-circle-outline" : "person-outline"} size={24} color={colors.textMuted} />
          </View>
        )}
        <View style={styles.messageContent}>
          <Text style={[styles.userName, { color: colors.text }]}>{name}</Text>
          <Text style={[styles.messageText, { color: colors.textMuted }]} numberOfLines={1}>
            {isSupport && isPlatformAdmin && !item.supportAssignee
              ? `New support request · ${preview}`
              : preview}
          </Text>
        </View>
        <View style={styles.trailing}>
          <Text style={[styles.timestamp, { color: colors.textMuted }]}>
            {item.lastMessageAt
              ? new Date(item.lastMessageAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : ""}
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
      <View style={styles.inboxHeader}>
        <Text style={[styles.title, { color: colors.text }]}>
          {showArchived ? "Archived messages" : "Messages"}
        </Text>
        <TouchableOpacity onPress={() => setShowArchived((value) => !value)}>
          <Text style={[styles.archiveToggle, { color: colors.primary }]}>
            {showArchived ? "Inbox" : "Archived"}
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={conversations}
        renderItem={renderConversation}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="chatbox-outline" size={56} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>No messages</Text>
            <Text style={[styles.messageText, { color: colors.textMuted }]}>
              Property inquiries and support conversations will appear here.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  inboxHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: { fontSize: 24, fontWeight: "700" },
  archiveToggle: { fontSize: 14, fontWeight: "700" },
  messageItem: {
    flexDirection: "row",
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: "center",
  },
  avatar: { width: 50, height: 50, borderRadius: 25, marginRight: 12 },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  messageContent: { flex: 1 },
  userName: { fontSize: 16, fontWeight: "600", marginBottom: 4 },
  messageText: { fontSize: 14 },
  trailing: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    justifyContent: "space-between",
    marginLeft: 8,
  },
  timestamp: { fontSize: 12 },
  unreadBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadBadgeText: { color: "#ffffff", fontSize: 12, fontWeight: "700" },
  headerActionButton: { minWidth: 54, alignItems: "center", gap: 3 },
  headerActionLabel: { fontSize: 11, fontWeight: "700" },
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: "700", marginTop: 16, marginBottom: 8 },
});
