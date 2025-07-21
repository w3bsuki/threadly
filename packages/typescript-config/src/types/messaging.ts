export interface Message {
  id: string
  conversationId: string
  senderId: string
  recipientId: string
  content: string
  isRead: boolean
  createdAt: Date
  updatedAt: Date
  attachments?: MessageAttachment[]
}

export interface MessageAttachment {
  id: string
  messageId: string
  url: string
  type: "image" | "file"
  name: string
  size: number
}

export interface Conversation {
  id: string
  participantIds: string[]
  lastMessage?: Message
  lastMessageAt: Date
  unreadCount: number
  productId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ConversationParticipant {
  userId: string
  username: string
  imageUrl?: string
  isOnline?: boolean
  lastSeen?: Date
}

export interface SendMessageInput {
  conversationId?: string
  recipientId: string
  content: string
  productId?: string
  attachments?: File[]
}

export interface MessageNotification {
  messageId: string
  conversationId: string
  senderId: string
  senderName: string
  content: string
  productTitle?: string
  timestamp: Date
}