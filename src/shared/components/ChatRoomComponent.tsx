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
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface ChatMessage {
  id: string;
  sender: "you" | "other";
  text: string;
  timestamp: string;
  avatar: string;
  deliveryStatus?: "sent" | "delivered" | "read";
  replyTo?: {
    sender: "you" | "other";
    text: string;
  };
}

interface ChatRoomProps {
  participantName: string;
  participantAvatar: string;
  initialMessages: ChatMessage[];
  onBack?: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({
  participantName,
  participantAvatar,
  initialMessages,
  onBack,
}) => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null);
  const replySwipeOffset = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSendMessage = () => {
    if (inputText.trim().length === 0) return;

    const newMessage: ChatMessage = {
      id: `msg${Date.now()}`,
      sender: "you",
      text: inputText,
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      deliveryStatus: "sent",
      replyTo: replyingTo
        ? { sender: replyingTo.sender, text: replyingTo.text }
        : undefined,
    };

    setMessages([...messages, newMessage]);
    setInputText("");
    setReplyingTo(null);
  };

  const handleDeleteChat = () => {
    setMenuVisible(false);
    onBack?.();
  };

  const handleArchiveChat = () => {
    setMenuVisible(false);
    onBack?.();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isYourMessage = item.sender === "you";
    const swipeResponder = PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) =>
        Math.abs(gesture.dx) > 15 && Math.abs(gesture.dy) < 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx > 0) {
          replySwipeOffset.setValue(Math.min(gesture.dx, 72));
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
    const noImage =
      "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";
    return (
      <Animated.View
        {...swipeResponder.panHandlers}
        style={[
          styles.messageWrapper,
          { transform: [{ translateX: replySwipeOffset }] },
          isYourMessage
            ? styles.yourMessageWrapper
            : styles.otherMessageWrapper,
        ]}
      >
        {!isYourMessage && (
          <Image
            source={{
              uri: "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png",
            }}
            style={styles.avatar}
          />
        )}
        <View style={isYourMessage ? styles.sentMessageColumn : undefined}>
          {item.replyTo && (
            <View
              style={[
                styles.replyQuote,
                { backgroundColor: colors.background, borderColor: colors.primary },
              ]}
            >
              <Text style={[styles.replyQuoteAuthor, { color: colors.primary }]}>
                {item.replyTo.sender === "you" ? "You" : participantName}
              </Text>
              <Text
                style={[styles.replyQuoteText, { color: colors.textMuted }]}
                numberOfLines={2}
              >
                {item.replyTo.text}
              </Text>
            </View>
          )}
          <View
            style={[
              styles.messageBubble,
              isYourMessage && styles.sentMessageBubble,
              isYourMessage
                ? [styles.yourMessage, { backgroundColor: "#007BFF" }]
                : [styles.otherMessage, { backgroundColor: colors.card }],
            ]}
          >
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
                <Ionicons
                  name={
                    item.deliveryStatus === "sent"
                      ? "checkmark"
                      : "checkmark-done"
                  }
                  size={16}
                  color={
                    item.deliveryStatus === "read" ? "#53BDEB" : "#B8B8B8"
                  }
                />
              </View>
            </View>
          )}
        </View>
        {isYourMessage && (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
      </Animated.View>
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
        {onBack && (
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.headerContent}>
          <Image
            source={{ uri: participantAvatar }}
            style={styles.headerAvatar}
          />
          <Text style={[styles.headerText, { color: colors.text }]}>
            {participantName}
          </Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="call" size={24} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}
          accessibilityLabel="Open chat actions"
        >
          <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
        </TouchableOpacity>
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
              <Text style={[styles.menuActionText, { color: colors.text }]}>Archive</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuAction}
              onPress={() => {
                setIsMuted((muted) => !muted);
                setMenuVisible(false);
              }}
            >
              <Ionicons
                name={isMuted ? "notifications-outline" : "notifications-off-outline"}
                size={20}
                color={colors.text}
              />
              <Text style={[styles.menuActionText, { color: colors.text }]}>
                {isMuted ? "Unmute" : "Mute"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuAction} onPress={handleDeleteChat}>
              <Ionicons name="trash-outline" size={20} color={colors.destructive} />
              <Text style={[styles.menuActionText, { color: colors.destructive }]}>Delete</Text>
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
        onEndReached={() =>
          flatListRef.current?.scrollToEnd({ animated: true })
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
          onChangeText={setInputText}
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
  headerText: {
    fontSize: 16,
    fontWeight: "600",
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
    borderRadius: 6,
    paddingHorizontal: 8,
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
