import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { apiRequest } from "../../shared/queryClient";

export interface ServerMessage {
  _id: string;
  clientMessageId: string;
  conversation: string;
  sender: string;
  receiver: string;
  text: string;
  status: "sent" | "delivered" | "read";
  replyTo?: {
    _id: string;
    sender: string;
    text: string;
    deleted?: boolean;
  } | null;
  deleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface ServerConversation {
  id: string;
  property: unknown;
  participants: Array<{
    _id: string;
    firstName?: string;
    lastName?: string;
    avatar?: { url?: string };
    role?: string;
  }>;
  lastMessage?: ServerMessage;
  lastMessageAt?: string;
  unreadCount: number;
}

export async function getOrCreatePropertyConversation(propertyId: string) {
  const response = await apiRequest("POST", "/conversations", { propertyId });
  return response.json() as Promise<{ conversation: ServerConversation }>;
}

export async function getConversations() {
  const response = await apiRequest("GET", "/conversations");
  return response.json() as Promise<{ conversations: ServerConversation[] }>;
}

export async function getMessages(conversationId: string, before?: string) {
  const query = before ? `?before=${encodeURIComponent(before)}` : "";
  const response = await apiRequest(
    "GET",
    `/conversations/${conversationId}/messages${query}`,
  );
  return response.json() as Promise<{ messages: ServerMessage[] }>;
}

export async function sendServerMessage(
  conversationId: string,
  clientMessageId: string,
  text: string,
  replyTo?: string,
) {
  const response = await apiRequest(
    "POST",
    `/conversations/${conversationId}/messages`,
    { clientMessageId, text, replyTo },
  );
  return response.json() as Promise<{ message: ServerMessage }>;
}

export async function markConversationRead(conversationId: string) {
  await apiRequest("PATCH", `/conversations/${conversationId}/read`);
}

export async function archiveConversation(conversationId: string) {
  await apiRequest("PATCH", `/conversations/${conversationId}/archive`);
}

export async function deleteServerMessage(
  conversationId: string,
  messageId: string,
) {
  await apiRequest(
    "DELETE",
    `/conversations/${conversationId}/messages/${messageId}`,
  );
}

export async function createMessagingSocket(): Promise<Socket> {
  const token = await AsyncStorage.getItem("authToken");
  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:4444/api";
  const socketUrl = apiUrl.replace(/\/api\/?$/, "");

  return io(socketUrl, {
    auth: { token },
    transports: ["websocket"],
  });
}
