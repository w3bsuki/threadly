import { z } from 'zod';

export const ConversationStatusSchema = z.enum([
  'ACTIVE',
  'ARCHIVED',
  'CLOSED',
  'BLOCKED',
]);
export type ConversationStatus = z.infer<typeof ConversationStatusSchema>;

export const MessageStatusSchema = z.enum([
  'SENT',
  'DELIVERED',
  'READ',
  'DELETED',
]);
export type MessageStatus = z.infer<typeof MessageStatusSchema>;

export const MessageTypeSchema = z.enum(['TEXT', 'IMAGE', 'OFFER', 'SYSTEM']);
export type MessageType = z.infer<typeof MessageTypeSchema>;

export const MessageAttachmentSchema = z.object({
  id: z.string(),
  messageId: z.string(),
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number().int().positive(),
  mimeType: z.string(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
});

export type MessageAttachment = z.infer<typeof MessageAttachmentSchema>;

export const MessageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string().min(1).max(5000),
  type: MessageTypeSchema.default('TEXT'),
  status: MessageStatusSchema.default('SENT'),
  attachments: z.array(MessageAttachmentSchema).optional(),
  metadata: z.record(z.string(), z.unknown()).nullable().optional(),
  editedAt: z.date().nullable().optional(),
  deletedAt: z.date().nullable().optional(),
  read: z.boolean().default(false),
  readAt: z.date().nullable().optional(),
  createdAt: z.date(),
});

export type Message = z.infer<typeof MessageSchema>;

export const ConversationParticipantSchema = z.object({
  userId: z.string(),
  firstName: z.string().nullable().optional(),
  lastName: z.string().nullable().optional(),
  imageUrl: z.string().url().nullable().optional(),
  email: z.string().email(),
});

export type ConversationParticipant = z.infer<
  typeof ConversationParticipantSchema
>;

export const ConversationProductSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number().positive(),
  status: z.string(),
  images: z.array(
    z.object({
      id: z.string(),
      imageUrl: z.string().url(),
      alt: z.string().nullable().optional(),
    })
  ),
});

export type ConversationProduct = z.infer<typeof ConversationProductSchema>;

export const ConversationSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  productId: z.string(),
  status: ConversationStatusSchema.default('ACTIVE'),
  buyer: ConversationParticipantSchema,
  seller: ConversationParticipantSchema,
  product: ConversationProductSchema,
  messages: z.array(MessageSchema).optional(),
  lastMessageAt: z.date().nullable().optional(),
  lastMessagePreview: z.string().nullable().optional(),
  unreadCount: z.number().int().min(0).default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Conversation = z.infer<typeof ConversationSchema>;

export const CreateMessageSchema = z.object({
  conversationId: z.string(),
  content: z.string().min(1).max(5000),
  type: MessageTypeSchema.optional(),
  attachments: z
    .array(
      z.object({
        url: z.string().url(),
        fileName: z.string(),
        fileSize: z.number().int().positive(),
        mimeType: z.string(),
      })
    )
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type CreateMessage = z.infer<typeof CreateMessageSchema>;

export const CreateConversationSchema = z.object({
  productId: z.string(),
  initialMessage: z.string().min(1).max(5000),
});

export type CreateConversation = z.infer<typeof CreateConversationSchema>;

export const TypingIndicatorSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
});

export type TypingIndicator = z.infer<typeof TypingIndicatorSchema>;

export const MessageNotificationSchema = z.object({
  conversationId: z.string(),
  messageId: z.string(),
  senderId: z.string(),
  senderName: z.string(),
  preview: z.string(),
  productTitle: z.string(),
  createdAt: z.string(),
});

export type MessageNotification = z.infer<typeof MessageNotificationSchema>;
