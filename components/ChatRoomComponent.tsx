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
  SafeAreaView,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

interface ChatMessage {
  id: string;
  sender: "you" | "other";
  text: string;
  timestamp: string;
  avatar: string;
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
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState("");
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
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isYourMessage = item.sender === "you";
    const noImage =
      "https://www.pngitem.com/pimgs/m/146-1468479_my-profile-icon-blank-profile-picture-circle-hd.png";
    return (
      <View
        style={[
          styles.messageWrapper,
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
        <View
          style={[
            styles.messageBubble,
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
          <Text
            style={[
              styles.timestamp,
              {
                color: isYourMessage ? "rgba(255,255,255,0.7)" : colors.text,
              },
            ]}
          >
            {item.timestamp}
          </Text>
        </View>
        {isYourMessage && (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        )}
      </View>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
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
      </View>

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
        style={[styles.inputContainer, { borderTopColor: colors.border }]}
      >
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
          placeholderTextColor={colors.text}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSendMessage}
          disabled={inputText.trim().length === 0}
        >
          <Ionicons
            name="send"
            size={20}
            color={inputText.trim().length === 0 ? "#ccc" : "#007BFF"}
          />
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
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
    marginTop: 4,
    opacity: 0.7,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  input: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 8,
    borderWidth: 1,
    maxHeight: 100,
  },
  sendButton: {
    padding: 8,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default ChatRoom;
