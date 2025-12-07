import React, { useState } from "react";
import { useInternetConnection } from "../hooks/useInternetConnection";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { mockMessages } from "../data/mockMessages";
import { Ionicons } from "@expo/vector-icons";

const MessagesScreen = ({ navigation }: any) => {
  const { colors } = useTheme();
  const [messages, setMessages] = useState(mockMessages);
  const isConnected = useInternetConnection();

  const markAllAsRead = () => {
    const updatedMessages = messages.map((msg) => ({ ...msg, unread: false }));
    setMessages(updatedMessages);
  };

  const renderMessage = ({ item }: any) => (
    <TouchableOpacity
      style={[styles.messageItem, { backgroundColor: colors.card }]}
      onPress={() => {
        navigation.navigate("Chat Room", {
          participantName: item.sender,
          participantAvatar: item.avatar,
          initialMessages: item || [],
        });
      }}
    >
      <Image source={{ uri: item.avatar }} style={styles.avatar} />
      <View style={styles.messageContent}>
        <Text style={[styles.sender, { color: colors.text }]}>
          {item.sender}
        </Text>
        <Text
          style={[styles.messageText, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.message}
        </Text>
      </View>
      <View style={styles.messageInfo}>
        <Text style={styles.timestamp}>{item.timestamp}</Text>
        {item.unread && <View style={styles.unreadIndicator} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          Messages
        </Text>
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.readAllButton}>Read All</Text>
        </TouchableOpacity>
      </View>

      {!isConnected && (
        <View style={{ alignItems: "center", marginVertical: 10 }}>
          <Text style={{ color: "red" }}>
            No internet connection detected. Some features may be unavailable.
          </Text>
        </View>
      )}
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
    padding: 20,
  },
  messageItem: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15,
  },
  messageContent: {
    flex: 1,
  },
  sender: {
    fontSize: 16,
    fontWeight: "bold",
  },
  messageText: {
    fontSize: 14,
    color: "gray",
  },
  messageInfo: {
    alignItems: "flex-end",
  },
  timestamp: {
    fontSize: 12,
    color: "gray",
  },
  unreadIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007BFF",
    marginTop: 5,
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
