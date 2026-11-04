import AsyncStorage from "@react-native-async-storage/async-storage";
import { io, Socket } from "socket.io-client";
import { apiRequest, uploadRequest } from "../../shared/queryClient";

export interface ServerAttachment {
  url: string;
  publicId?: string | null;
  fileName?: string | null;
  fileSize?: number | null;
  mimeType?: string | null;
  resourceType?: string | null;
}

export interface ServerMessage {
  _id: string;
  clientMessageId: string;
  conversation: string;
  sender: string;
  receiver: string | null;
  text: string;
  messageType?: "text" | "image" | "video" | "file";
  attachment?: ServerAttachment | null;
  status: "sent" | "delivered" | "read";
  replyTo?: {
    _id: string;
    sender: string;
    text: string;
    messageType?: string;
    attachment?: ServerAttachment | null;
    deleted?: boolean;
  } | null;
  deleted?: boolean;
  deletedAt?: string;
  createdAt: string;
}

export interface ServerConversation {
  id: string;
  type?: "property" | "support";
  property: unknown | null;
  supportUser?: ServerConversation["participants"][number] | string | null;
  supportAssignee?: ServerConversation["participants"][number] | string | null;
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

export async function getOrCreateSupportConversation() {
  const response = await apiRequest("POST", "/conversations/support");
  return response.json() as Promise<{ conversation: ServerConversation }>;
}

export async function getConversations(archived = false) {
  const query = archived ? "?archived=true" : "";
  const response = await apiRequest("GET", `/conversations${query}`);
  return response.json() as Promise<{ conversations: ServerConversation[] }>;
}

export async function getMessages(
  conversationId: string,
  before?: string,
  limit = 30,
) {
  const params = new URLSearchParams({ limit: String(limit) });
  if (before) params.set("before", before);
  const response = await apiRequest(
    "GET",
    `/conversations/${conversationId}/messages?${params.toString()}`,
  );
  return response.json() as Promise<{
    messages: ServerMessage[];
    hasMore: boolean;
    nextCursor: string | null;
  }>;
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

export async function hideConversation(conversationId: string) {
  await apiRequest("DELETE", `/conversations/${conversationId}`);
}

export async function restoreConversation(conversationId: string) {
  await apiRequest("PATCH", `/conversations/${conversationId}/restore`);
}

export async function claimSupportConversation(conversationId: string) {
  const response = await apiRequest(
    "POST",
    `/conversations/${conversationId}/claim`,
  );
  return response.json() as Promise<{ conversation: ServerConversation }>;
}

export async function uploadMessageAttachment(
  conversationId: string,
  clientMessageId: string,
  attachment: FormData,
  onProgress?: (progress: number) => void,
) {
  attachment.append("clientMessageId", clientMessageId);
  const result = await uploadRequest(
    "POST",
    `/conversations/${conversationId}/messages/attachment`,
    attachment,
    onProgress,
  );
  return result as { message: ServerMessage };
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
