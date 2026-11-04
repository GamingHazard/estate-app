import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  KeyboardAvoidingView,
  Platform,
  Modal,
  Pressable,
  PanResponder,
  Animated,
  Alert,
  Linking,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../features/auth/AuthContext";
import {
  createMessagingSocket,
  deleteServerMessage,
  getMessages,
  hideConversation,
  markConversationRead,
  restoreConversation,
  sendServerMessage,
  uploadMessageAttachment,
  ServerAttachment,
  ServerMessage,
} from "../../features/messaging/messagingApi";

interface LocalAttachment {
  uri: string;
  name: string;
  type: string;
  kind: "image" | "video" | "file";
  size?: number;
}

interface ChatMessage {
  id: string;
  clientMessageId?: string;
  sender: "you" | "other";
  text: string;
  timestamp: string;
  avatar: string;
  deliveryStatus?: "sent" | "delivered" | "read" | "failed";
  messageType?: "text" | "image" | "video" | "file";
  attachment?: ServerAttachment | null;
  pendingAttachment?: LocalAttachment;
  uploadProgress?: number;
  replyTo?: {
    sender: "you" | "other";
    text: string;
    messageId?: string;
    deleted?: boolean;
  };
}

interface ChatRoomProps {
  participantName: string;
  participantAvatar: string;
  initialMessages: ChatMessage[];
  onBack?: () => void;
  conversationId?: string;
}

const toChatMessage = (
  message: ServerMessage,
  currentUserId?: string,
  currentUserAvatar?: string,
  participantAvatar?: string,
): ChatMessage => {
  const isCurrentUser = String(message.sender) === String(currentUserId);
  return {
    id: message._id,
    clientMessageId: message.clientMessageId,
    sender: isCurrentUser ? "you" : "other",
    text: message.deleted ? "This message was deleted." : message.text,
    timestamp: new Date(message.createdAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    }),
    avatar: isCurrentUser ? currentUserAvatar || "" : participantAvatar || "",
    deliveryStatus: message.status,
    messageType: message.messageType,
    attachment: message.deleted ? null : message.attachment,
    replyTo: message.replyTo?.deleted
      ? { sender: "other", text: "This message was deleted.", deleted: true }
      : message.replyTo
        ? {
            sender:
              String(message.replyTo.sender) === String(currentUserId)
                ? "you"
                : "other",
            text: message.replyTo.text,
            messageId: message.replyTo._id,
          }
        : undefined,
  };
};

const ChatRoom: React.FC<ChatRoomProps> = ({
  participantName,
  participantAvatar,
  initialMessages,
  onBack,
  conversationId,
}) => {
  const { colors } = useTheme();
  const { user, openAuth } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [hasOlderMessages, setHasOlderMessages] = useState(false);
  const [loadingOlderMessages, setLoadingOlderMessages] = useState(false);
  const [olderMessagesCursor, setOlderMessagesCursor] = useState<string | null>(null);
  const replySwipeOffsets = useRef<Record<string, Animated.Value>>({});
  const flatListRef = useRef<FlatList>(null);
  const messagingSocketRef = useRef<Awaited<ReturnType<typeof createMessagingSocket>> | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suppressAutoScrollRef = useRef(false);
  const connectErrorShownRef = useRef(false);

  useEffect(() => {
    if (!conversationId) return;
    let active = true;
    setMessages([]);
    setHasOlderMessages(false);
    setOlderMessagesCursor(null);
    void restoreConversation(conversationId).catch((error) => {
      console.error("Unable to restore conversation:", error);
      if (active) Alert.alert("Unable to reopen conversation", "Please try again.");
    });
    const refreshLatestMessages = async () => {
      const result = await getMessages(conversationId);
      if (!active) return;
      const fetched = result.messages.map((message) =>
        toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar),
      );
      setMessages((current) => {
        const merged = [...current];
        for (const message of fetched) {
          const index = merged.findIndex(
            (item) =>
              item.id === message.id ||
              (item.clientMessageId &&
                item.clientMessageId === message.clientMessageId),
          );
          if (index >= 0) merged[index] = message;
          else merged.push(message);
        }
        return merged;
      });
      setHasOlderMessages(result.hasMore);
      setOlderMessagesCursor(result.nextCursor);
    };
    void refreshLatestMessages().catch((error) => {
      console.error("Unable to load chat messages:", error);
      if (active) Alert.alert("Unable to load messages", "Please try again.");
    });
    void markConversationRead(conversationId).catch((error) => {
      console.error("Unable to mark conversation read:", error);
      if (active) Alert.alert("Unable to update read status", "Please try again.");
    });

    let socket: Awaited<ReturnType<typeof createMessagingSocket>> | undefined;
    void createMessagingSocket().then((connectedSocket) => {
      if (!active) {
        connectedSocket.disconnect();
        return;
      }
      socket = connectedSocket;
      messagingSocketRef.current = socket;
      const joinConversation = () => {
        connectErrorShownRef.current = false;
        socket?.emit(
          "conversation:join",
          conversationId,
          (result: { success?: boolean; message?: string }) => {
            if (!result?.success) {
              console.error("Unable to join messaging conversation:", result?.message);
              return;
            }
            void refreshLatestMessages().catch((error) =>
              console.error("Unable to recover messages after reconnect:", error),
            );
            void markConversationRead(conversationId).catch((error) =>
              console.error("Unable to mark conversation read:", error),
            );
          },
        );
      };
      socket.on("connect", joinConversation);
      socket.on("connect_error", (error) => {
        console.error("Chat socket connection failed:", error);
        if (!connectErrorShownRef.current && active) {
          connectErrorShownRef.current = true;
          Alert.alert(
            "Chat connection unavailable",
            "Real-time updates will resume when the connection is restored.",
          );
        }
      });
      if (socket.connected) joinConversation();
      socket.on("message:new", (message: ServerMessage) => {
        if (String(message.conversation) !== String(conversationId)) return;
        setMessages((current) => {
          const optimisticIndex = current.findIndex(
            (item) => item.clientMessageId === message.clientMessageId,
          );
          if (optimisticIndex >= 0) {
            return current.map((item, index) =>
              index === optimisticIndex
                ? toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar)
                : item,
            );
          }
          if (current.some((item) => item.id === message._id)) return current;
          return [...current, toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar)];
        });
        if (String(message.sender) !== String(user?.id)) {
          socket?.emit("message:delivered", {
            conversationId,
            messageId: message._id,
          });
          void markConversationRead(conversationId).catch((error) => {
            console.error("Unable to mark incoming message read:", error);
            Alert.alert("Unable to update read status", "Please try again.");
          });
        }
      });
      socket.on("message:deleted", ({ messageId }: { messageId: string }) => {
        setMessages((current) =>
          current.map((item) =>
            item.id === messageId
              ? { ...item, text: "This message was deleted.", attachment: null }
              : item,
          ),
        );
      });
      socket.on("message:read", ({ readerId, conversationId: eventConversationId }: {
        readerId?: string;
        conversationId?: string;
      }) => {
        if (
          String(eventConversationId) !== String(conversationId) ||
          String(readerId) === String(user?.id)
        ) return;
        setMessages((current) =>
          current.map((item) =>
            item.sender === "you" && item.deliveryStatus !== "read"
              ? { ...item, deliveryStatus: "read" }
              : item,
          ),
        );
      });
      socket.on("message:status", ({ status, receiverId, conversationId: eventConversationId }: {
        status?: "delivered";
        receiverId?: string;
        conversationId?: string;
      }) => {
        if (
          status !== "delivered" ||
          String(eventConversationId) !== String(conversationId) ||
          String(receiverId) === String(user?.id)
        ) return;
        setMessages((current) =>
          current.map((item) =>
            item.sender === "you" && item.deliveryStatus === "sent"
              ? { ...item, deliveryStatus: "delivered" }
              : item,
          ),
        );
      });
      socket.on("typing:start", () => setIsTyping(true));
      socket.on("typing:stop", () => setIsTyping(false));
    }).catch((error) => {
      console.error("Unable to connect chat:", error);
      if (active) Alert.alert("Chat connection unavailable", "Messages will retry when you reopen the conversation.");
    });

    return () => {
      active = false;
      socket?.emit("typing:stop", conversationId);
      messagingSocketRef.current = null;
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      socket?.disconnect();
    };
  }, [conversationId, user?.id]);

  useEffect(() => {
    if (suppressAutoScrollRef.current) {
      suppressAutoScrollRef.current = false;
      return;
    }
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const loadOlderMessages = async () => {
    if (!conversationId || !olderMessagesCursor || loadingOlderMessages) return;
    setLoadingOlderMessages(true);
    suppressAutoScrollRef.current = true;
    try {
      const result = await getMessages(conversationId, olderMessagesCursor);
      const older = result.messages.map((message) =>
        toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar),
      );
      setMessages((current) => {
        const knownIds = new Set(current.map((message) => message.id));
        return [
          ...older.filter((message) => !knownIds.has(message.id)),
          ...current,
        ];
      });
      setHasOlderMessages(result.hasMore);
      setOlderMessagesCursor(result.nextCursor);
    } catch (error) {
      suppressAutoScrollRef.current = false;
      console.error("Unable to load older messages:", error);
      Alert.alert("Unable to load earlier messages", "Please try again.");
    } finally {
      setLoadingOlderMessages(false);
    }
  };

  const sendChatMessage = async (
    text: string,
    attachment: LocalAttachment | undefined,
    clientMessageId: string,
    replyToId?: string,
  ) => {
    if (!conversationId) {
      Alert.alert("Unable to send message", "This chat is not connected to a conversation.");
      return;
    }
    try {
      if (attachment) {
        const formData = new FormData();
        formData.append("attachment", {
          uri: attachment.uri,
          name: attachment.name,
          type: attachment.type,
        } as any);
        formData.append("text", text);
        if (replyToId && /^[a-f\d]{24}$/i.test(replyToId)) {
          formData.append("replyTo", replyToId);
        }
        const { message } = await uploadMessageAttachment(
          conversationId,
          clientMessageId,
          formData,
          (progress) =>
            setMessages((current) =>
              current.map((item) =>
                item.clientMessageId === clientMessageId
                  ? { ...item, uploadProgress: progress }
                  : item,
              ),
            ),
        );
        setMessages((current) =>
          current.map((item) =>
            item.clientMessageId === clientMessageId
              ? toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar)
              : item,
          ),
        );
      } else {
        const { message } = await sendServerMessage(
          conversationId,
          clientMessageId,
          text,
          replyToId && /^[a-f\d]{24}$/i.test(replyToId) ? replyToId : undefined,
        );
        setMessages((current) =>
          current.map((item) =>
            item.clientMessageId === clientMessageId
              ? toChatMessage(message, user?.id, user?.avatar?.url, participantAvatar)
              : item,
          ),
        );
      }
    } catch (error) {
      console.error("Unable to send message:", error);
      setMessages((current) =>
        current.map((item) =>
          item.clientMessageId === clientMessageId
            ? { ...item, deliveryStatus: "failed" }
            : item,
        ),
      );
      Alert.alert("Message not sent", "Check your connection and tap Retry.");
    }
  };

  const createOutgoingMessage = (
    text: string,
    attachment?: LocalAttachment,
    clientMessageId = `${user?.id}-${conversationId}-${Date.now()}-${Math.random()}`,
    reply = replyingTo,
  ) => {
    const message: ChatMessage = {
      id: clientMessageId,
      clientMessageId,
      sender: "you",
      text,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      avatar: user?.avatar?.url || "",
      deliveryStatus: "sent",
      pendingAttachment: attachment,
      replyTo: reply
        ? {
            sender: reply.sender,
            text: reply.text,
            messageId: reply.id,
          }
        : undefined,
    };
    setMessages((current) => [...current, message]);
    void sendChatMessage(text, attachment, clientMessageId, reply?.id);
  };

  const handleSendMessage = () => {
    const text = inputText.trim();
    if (!text) return;
    if (!user) {
      openAuth();
      return;
    }
    createOutgoingMessage(text);
    setInputText("");
    setReplyingTo(null);
    messagingSocketRef.current?.emit("typing:stop", conversationId);
  };

  const retryMessage = (message: ChatMessage) => {
    if (!message.clientMessageId || message.deliveryStatus !== "failed") return;
    setMessages((current) =>
      current.map((item) =>
        item.clientMessageId === message.clientMessageId
          ? { ...item, deliveryStatus: "sent", uploadProgress: 0 }
          : item,
      ),
    );
    void sendChatMessage(
      message.text,
      message.pendingAttachment,
      message.clientMessageId,
      message.replyTo?.messageId,
    );
  };

  const sendAttachment = (attachment: LocalAttachment) => {
    if (!user) {
      openAuth();
      return;
    }
    if (attachment.size && attachment.size > 20 * 1024 * 1024) {
      Alert.alert("Attachment too large", "Attachments must be 20 MB or smaller.");
      return;
    }
    if (!["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif", "video/mp4", "video/quicktime", "application/pdf", "text/plain"].includes(attachment.type)) {
      Alert.alert("Unsupported attachment", "Choose an image, MP4/MOV video, PDF, or text file.");
      return;
    }
    createOutgoingMessage(inputText.trim(), attachment);
    setInputText("");
    setReplyingTo(null);
  };

  const pickPhotoOrVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images", "videos"],
        quality: 0.85,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const mimeType = asset.mimeType ||
        (asset.type === "video" ? "video/mp4" : "image/jpeg");
      sendAttachment({
        uri: asset.uri,
        name: asset.fileName || `attachment-${Date.now()}`,
        type: mimeType,
        kind: asset.type === "video" ? "video" : "image",
        size: asset.fileSize,
      });
    } catch (error) {
      console.error("Unable to select photo or video:", error);
      Alert.alert("Unable to select attachment", "Please try again.");
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "text/plain"],
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      const inferredType = asset.mimeType ||
        (asset.name.toLowerCase().endsWith(".pdf")
          ? "application/pdf"
          : "text/plain");
      sendAttachment({
        uri: asset.uri,
        name: asset.name,
        type: inferredType,
        kind: "file",
        size: asset.size,
      });
    } catch (error) {
      console.error("Unable to select document:", error);
      Alert.alert("Unable to select attachment", "Please try again.");
    }
  };

  const chooseAttachment = () => {
    Alert.alert("Add attachment", "Choose a photo, video, or document.", [
      {
        text: "Photo or video",
        onPress: () => void pickPhotoOrVideo(),
      },
      {
        text: "Document",
        onPress: () => void pickDocument(),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleArchiveChat = async () => {
    setMenuVisible(false);
    if (!conversationId) return;
    try {
      await hideConversation(conversationId);
      onBack?.();
    } catch (error) {
      console.error("Unable to archive conversation:", error);
      Alert.alert("Unable to archive conversation", "Please try again.");
    }
  };

  const deleteSelectedMessage = async () => {
    if (!selectedMessageId) return;
    if (!conversationId || !/^[a-f\d]{24}$/i.test(selectedMessageId)) {
      Alert.alert("Unable to delete message", "Only sent messages can be deleted.");
      return;
    }
    try {
      await deleteServerMessage(conversationId, selectedMessageId);
      setMessages((current) =>
        current.map((message) =>
          message.id === selectedMessageId
            ? { ...message, text: "This message was deleted.", attachment: null }
            : message,
        ),
      );
      setSelectedMessageId(null);
    } catch (error) {
      console.error("Unable to delete message:", error);
      Alert.alert("Unable to delete message", "Please try again.");
    }
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isYourMessage = item.sender === "you";
    if (!replySwipeOffsets.current[item.id]) {
      replySwipeOffsets.current[item.id] = new Animated.Value(0);
    }
    const replySwipeOffset = replySwipeOffsets.current[item.id];
    const swipeResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 15 && Math.abs(gesture.dy) < 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          replySwipeOffset.setValue(Math.min(gesture.dx, 72));
        } else {
          replySwipeOffset.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > 45) setReplyingTo(item);
        Animated.spring(replySwipeOffset, {
          toValue: 0,
          useNativeDriver: true,
          speed: 24,
          bounciness: 0,
        }).start();
      },
      onPanResponderTerminate: () => {
        Animated.spring(replySwipeOffset, {
          toValue: 0,
          useNativeDriver: true,
          speed: 24,
          bounciness: 0,
        }).start();
      },
    });
    return (
      <TouchableOpacity
        onLongPress={
          isYourMessage
            ? () => {
                if (!user) {
                  openAuth();
                  return;
                }
                setSelectedMessageId((current) =>
                  current === item.id ? null : item.id,
                );
              }
            : undefined
        }
        delayLongPress={500}
        style={[
          styles.messageWrapper,
          isYourMessage
            ? styles.yourMessageWrapper
            : styles.otherMessageWrapper,
          selectedMessageId === item.id && [
            styles.selectedMessage,
            { borderColor: colors.primary },
          ],
        ]}
      >
        <Animated.View
          {...swipeResponder.panHandlers}
          style={[
            styles.messageSwipeRow,
            { transform: [{ translateX: replySwipeOffset }] },
          ]}
        >
        {!isYourMessage && participantAvatar ? (
          <Image source={{ uri: participantAvatar }} style={styles.avatar} />
        ) : null}
        <View style={isYourMessage ? styles.sentMessageColumn : undefined}>
          <View
            style={[
              styles.messageBubble,
              isYourMessage && styles.sentMessageBubble,
              isYourMessage
                ? [styles.yourMessage, { backgroundColor: "#007BFF" }]
                : [styles.otherMessage, { backgroundColor: colors.card }],
            ]}
          >
            {item.replyTo && (
              <View
                style={[
                  styles.replyQuote,
                  {
                    backgroundColor: isYourMessage
                      ? "rgba(255, 255, 255, 0.14)"
                      : colors.background,
                    borderLeftColor: isYourMessage ? "#ffffff" : colors.primary,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.replyQuoteAuthor,
                    { color: isYourMessage ? "#ffffff" : colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  {item.replyTo.sender === "you" ? "You" : participantName}
                </Text>
                <Text
                  style={[
                    styles.replyQuoteText,
                    { color: isYourMessage ? "rgba(255, 255, 255, 0.82)" : colors.textMuted },
                  ]}
                  numberOfLines={2}
                >
                  {item.replyTo.text}
                </Text>
              </View>
            )}
            {item.attachment?.mimeType?.startsWith("image/") ? (
              <TouchableOpacity
                onPress={() =>
                  void Linking.openURL(item.attachment!.url).catch((error) => {
                    console.error("Unable to open attachment:", error);
                    Alert.alert("Unable to open attachment", "Please try again.");
                  })
                }
              >
                <Image
                  source={{ uri: item.attachment.url }}
                  style={styles.messageAttachmentImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ) : item.attachment ? (
              <TouchableOpacity
                style={styles.messageAttachmentFile}
                onPress={() =>
                  void Linking.openURL(item.attachment!.url).catch((error) => {
                    console.error("Unable to open attachment:", error);
                    Alert.alert("Unable to open attachment", "Please try again.");
                  })
                }
              >
                <Ionicons
                  name={item.messageType === "video" ? "videocam-outline" : "document-outline"}
                  size={20}
                  color={isYourMessage ? "#ffffff" : colors.primary}
                />
                <Text
                  style={[
                    styles.messageAttachmentName,
                    { color: isYourMessage ? "#ffffff" : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {item.attachment.fileName || "Open attachment"}
                </Text>
              </TouchableOpacity>
            ) : item.pendingAttachment ? (
              <View style={styles.messageAttachmentFile}>
                <Ionicons
                  name={item.pendingAttachment.kind === "video" ? "videocam-outline" : item.pendingAttachment.kind === "image" ? "image-outline" : "document-outline"}
                  size={20}
                  color={isYourMessage ? "#ffffff" : colors.primary}
                />
                <Text
                  style={[
                    styles.messageAttachmentName,
                    { color: isYourMessage ? "#ffffff" : colors.text },
                  ]}
                  numberOfLines={1}
                >
                  {item.pendingAttachment.name}
                </Text>
              </View>
            ) : null}
            {item.text ? (
              <Text
                style={[
                  styles.messageText,
                  {
                    color: isYourMessage ? "#fff" : colors.text,
                  },
                ]}
              >
                {item.text}
              </Text>
            ) : null}
            {!isYourMessage && (
              <Text style={[styles.receivedTimestamp, { color: colors.textMuted }]}>
                {item.timestamp}
              </Text>
            )}
          </View>
          {isYourMessage && (
            <View style={styles.messageMeta}>
              <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                {item.timestamp}
              </Text>
              <View style={styles.deliveryTicks}>
                {item.uploadProgress !== undefined &&
                item.deliveryStatus === "sent" ? (
                  <Text style={[styles.timestamp, { color: colors.textMuted }]}>
                    {item.uploadProgress}%
                  </Text>
                ) : (
                  <Ionicons
                    name={
                      item.deliveryStatus === "failed"
                        ? "alert-circle"
                        : item.deliveryStatus === "sent"
                          ? "checkmark"
                          : "checkmark-done"
                    }
                    size={16}
                    color={
                      item.deliveryStatus === "failed"
                        ? colors.destructive
                        : item.deliveryStatus === "read"
                          ? "#53BDEB"
                          : "#B8B8B8"
                    }
                  />
                )}
              </View>
            </View>
          )}
          {isYourMessage && item.deliveryStatus === "failed" ? (
            <TouchableOpacity
              style={styles.retryButton}
              onPress={() => retryMessage(item)}
              accessibilityLabel="Retry sending message"
            >
              <Text style={[styles.retryText, { color: colors.destructive }]}>
                Retry
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
        {isYourMessage && (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background, paddingTop: insets.top },
      ]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        {selectedMessageId ? (
          <TouchableOpacity
            style={styles.messageActionButton}
            onPress={deleteSelectedMessage}
          >
            <Ionicons name="trash-outline" size={20} color={colors.destructive} />
            <Text style={[styles.messageActionLabel, { color: colors.destructive }]}>
              Delete
            </Text>
          </TouchableOpacity>
        ) : onBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        ) : null}
        <View style={styles.headerContent}>
          {selectedMessageId ? (
            <Text style={[styles.headerText, { color: colors.text }]}>
              1 selected
            </Text>
          ) : (
            <>
              {participantAvatar ? (
                <Image
                  source={{ uri: participantAvatar }}
                  style={styles.headerAvatar}
                />
              ) : (
                <View style={[styles.headerAvatar, styles.headerAvatarPlaceholder, { backgroundColor: colors.border }]}>
                  <Ionicons name="person-outline" size={22} color={colors.textMuted} />
                </View>
              )}
              <Text style={[styles.headerText, { color: colors.text }]}>
                {participantName}
              </Text>
              {isTyping && (
                <Text style={[styles.typingText, { color: colors.textMuted }]}>
                  typing...
                </Text>
              )}
            </>
          )}
        </View>
        {selectedMessageId ? (
          <TouchableOpacity
            style={styles.messageActionButton}
            onPress={() => setSelectedMessageId(null)}
            accessibilityLabel="Close message actions"
          >
            <Ionicons name="close-outline" size={20} color={colors.textMuted} />
            <Text style={styles.messageActionLabel}>Close</Text>
          </TouchableOpacity>
        ) : null}
        {!selectedMessageId && <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Open chat actions"
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>}
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={styles.menuBackdrop}
          onPress={() => setMenuVisible(false)}
        >
          <View style={[styles.menuDialog, { backgroundColor: colors.card }]}>
            <TouchableOpacity style={styles.menuAction} onPress={handleArchiveChat}>
              <Ionicons name="archive-outline" size={20} color={colors.text} />
              <Text style={[styles.menuActionText, { color: colors.text }]}>Hide from inbox</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        maintainVisibleContentPosition={{ minIndexForVisible: 1 }}
        ListHeaderComponent={
          hasOlderMessages ? (
            <TouchableOpacity
              style={styles.loadOlderButton}
              onPress={() => void loadOlderMessages()}
              disabled={loadingOlderMessages}
            >
              {loadingOlderMessages ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[styles.loadOlderText, { color: colors.primary }]}>
                  Load earlier messages
                </Text>
              )}
            </TouchableOpacity>
          ) : null
        }
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.inputContainer,
          {
            borderTopColor: colors.border,
            backgroundColor: colors.card,
            paddingBottom: Math.max(insets.bottom, 10),
          },
        ]}
      >
        {replyingTo && (
          <View style={[styles.replyComposer, { borderLeftColor: colors.primary }]}>
            <View style={styles.replyComposerCopy}>
              <Text style={[styles.replyQuoteAuthor, { color: colors.primary }]}>
                Replying to {replyingTo.sender === "you" ? "yourself" : participantName}
              </Text>
              <Text style={[styles.replyQuoteText, { color: colors.textMuted }]} numberOfLines={1}>
                {replyingTo.text}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setReplyingTo(null)} accessibilityLabel="Cancel reply">
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.composerRow}>
        <TouchableOpacity
          style={styles.attachmentButton}
          onPress={chooseAttachment}
          accessibilityLabel="Add attachment"
        >
          <Ionicons name="attach-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: colors.card,
              color: colors.text,
              borderColor: colors.border,
            },
          ]}
          placeholder="Type a message..."
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={(text) => {
            setInputText(text);
            if (!conversationId || !messagingSocketRef.current) return;
            if (text.length > 0) {
              messagingSocketRef.current.emit("typing:start", conversationId);
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                messagingSocketRef.current?.emit("typing:stop", conversationId);
              }, 1500);
            } else {
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              messagingSocketRef.current.emit("typing:stop", conversationId);
            }
          }}
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            {
              backgroundColor:
                inputText.trim().length === 0 ? colors.border : colors.primary,
            },
          ]}
          onPress={handleSendMessage}
          disabled={inputText.trim().length === 0}
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={20}
            color="#ffffff"
          />
        </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
  },
  backButton: {
    marginRight: 10,
  },
  headerContent: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    marginRight: 12,
  },
  headerAvatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  headerText: {
    fontSize: 16,
    fontWeight: "600",
  },
  typingText: {
    marginLeft: 8,
    fontSize: 12,
    fontStyle: "italic",
  },
  menuButton: {
    marginLeft: 14,
    padding: 4,
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    alignItems: "flex-end",
  },
  menuDialog: {
    marginTop: 72,
    marginRight: 12,
    width: 180,
    borderRadius: 10,
    paddingVertical: 6,
    elevation: 8,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  menuAction: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
  },
  menuActionText: {
    fontSize: 15,
    fontWeight: "600",
  },
  messagesList: {
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  messageWrapper: {
    flexDirection: "row",
    marginVertical: 8,
    alignItems: "flex-end",
  },
  yourMessageWrapper: {
    justifyContent: "flex-end",
  },
  otherMessageWrapper: {
    justifyContent: "flex-start",
  },
  messageSwipeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  selectedMessage: {
    borderRadius: 12,
    borderWidth: 2,
    marginHorizontal: 2,
    paddingHorizontal: 2,
  },
  messageActionButton: {
    minWidth: 54,
    alignItems: "center",
    gap: 3,
  },
  messageActionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: "#777777",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginHorizontal: 8,
  },
  messageBubble: {
    maxWidth: "70%",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  yourMessage: {
    borderBottomRightRadius: 4,
  },
  otherMessage: {
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageAttachmentImage: {
    width: 220,
    height: 180,
    borderRadius: 8,
    marginBottom: 6,
  },
  messageAttachmentFile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 6,
  },
  messageAttachmentName: {
    maxWidth: 200,
    fontSize: 14,
    fontWeight: "600",
  },
  retryButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 6,
    paddingTop: 4,
  },
  retryText: { fontSize: 12, fontWeight: "700" },
  loadOlderButton: {
    alignSelf: "center",
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 12,
  },
  loadOlderText: { fontSize: 13, fontWeight: "600" },
  timestamp: {
    fontSize: 12,
    opacity: 0.7,
  },
  messageMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 4,
  },
  sentMessageColumn: {
    maxWidth: "70%",
    alignItems: "flex-end",
  },
  sentMessageBubble: {
    maxWidth: "100%",
  },
  deliveryTicks: {
    flexDirection: "row",
    alignItems: "center",
  },
  receivedTimestamp: {
    alignSelf: "flex-end",
    fontSize: 12,
    marginTop: 5,
    opacity: 0.7,
  },
  inputContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  composerRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  attachmentButton: {
    width: 36,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  replyComposer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderLeftWidth: 3,
  },
  replyComposerCopy: {
    flex: 1,
  },
  replyQuote: {
    maxWidth: "100%",
    borderLeftWidth: 3,
    borderRadius: 4,
    paddingLeft: 8,
    paddingRight: 10,
    paddingVertical: 5,
    marginBottom: 6,
  },
  replyQuoteAuthor: {
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 2,
  },
  replyQuoteText: {
    fontSize: 12,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 112,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 11,
    paddingBottom: 11,
    borderWidth: 1,
    fontSize: 15,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 0,
  },
});

export default ChatRoom;
