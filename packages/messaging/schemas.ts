/**
 * Messaging validation schemas
 * Re-exports and extends schemas from @repo/validation
 */

import { z } from 'zod';

// Re-export message schemas from validation package
export {
  messageTypeSchema,
  conversationStatusSchema,
  messageContentSchema,
  createMessageSchema,
  createOfferMessageSchema,
  updateMessageSchema,
  deleteMessageSchema,
  markAsReadSchema,
  conversationFilterSchema,
  reportMessageSchema,
  blockConversationSchema,
  typingIndicatorSchema,
  messageReactionSchema,
  conversationSettingsSchema,
  messageTemplateSchema,
  quickReplySchema,
  messageSearchSchema,
  bulkMessageOperationSchema,
} from '@repo/validation/schemas/message';

// Additional schemas specific to the messaging package
export const sendMessageRequestSchema = z.object({
  conversationId: z.string().min(1),
  content: z.string().min(1).max(1000),
  imageUrl: z.string().url().optional(),
});

export const fetchMessagesRequestSchema = z.object({
  conversationId: z.string().min(1),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export const createConversationRequestSchema = z.object({
  productId: z.string().min(1),
  initialMessage: z.string().min(1).max(1000),
});

export const conversationParticipantSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
});

export const messageParticipantSchema = z.object({
  id: z.string(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  imageUrl: z.string().url().nullable(),
});

export const productInfoSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']),
  images: z.array(z.object({
    imageUrl: z.string().url(),
    alt: z.string().optional(),
  })),
});

export const messageWithSenderSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  imageUrl: z.string().url().nullable(),
  read: z.boolean(),
  createdAt: z.date(),
  sender: messageParticipantSchema,
  isOwnMessage: z.boolean().optional(),
});

export const conversationWithDetailsSchema = z.object({
  id: z.string(),
  buyerId: z.string(),
  sellerId: z.string(),
  productId: z.string(),
  status: z.enum(['ACTIVE', 'ARCHIVED']),
  createdAt: z.date(),
  updatedAt: z.date(),
  buyer: conversationParticipantSchema,
  seller: conversationParticipantSchema,
  product: productInfoSchema,
  messages: z.array(messageWithSenderSchema),
  unreadCount: z.number().optional(),
  lastMessage: messageWithSenderSchema.optional(),
});

export const conversationListItemSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productTitle: z.string(),
  productImage: z.string().url(),
  productPrice: z.string(),
  otherParticipant: z.object({
    id: z.string(),
    name: z.string(),
    avatar: z.string().url().optional(),
  }),
  lastMessage: z.object({
    content: z.string(),
    createdAt: z.date(),
    isOwnMessage: z.boolean(),
  }).optional(),
  unreadCount: z.number(),
  status: z.enum(['ACTIVE', 'ARCHIVED']),
  updatedAt: z.date(),
});

export const messagesPaginationSchema = z.object({
  page: z.number(),
  limit: z.number(),
  total: z.number(),
  totalPages: z.number(),
  hasNextPage: z.boolean(),
  hasPreviousPage: z.boolean(),
});

export const messagesResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    messages: z.array(messageWithSenderSchema),
    pagination: messagesPaginationSchema,
  }).optional(),
  error: z.string().optional(),
});

export const sendMessageResultSchema = z.object({
  success: z.boolean(),
  message: messageWithSenderSchema.optional(),
  error: z.string().optional(),
  details: z.any().optional(),
});

export const createConversationResultSchema = z.object({
  success: z.boolean(),
  conversation: conversationWithDetailsSchema.optional(),
  error: z.string().optional(),
  details: z.any().optional(),
});

export const markAsReadResultSchema = z.object({
  success: z.boolean(),
  error: z.string().optional(),
});

// Real-time event schemas
export const messageEventSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  imageUrl: z.string().url().optional(),
  createdAt: z.date(),
  type: z.enum(['message', 'typing', 'read']),
});

export const typingEventSchema = z.object({
  conversationId: z.string(),
  userId: z.string(),
  isTyping: z.boolean(),
});

// Client state schemas
export const connectionStatusSchema = z.enum([
  'connecting',
  'connected', 
  'disconnected',
  'error'
]);

export const messageStatusSchema = z.enum([
  'sending',
  'sent', 
  'delivered',
  'read',
  'failed'
]);

export const clientMessageSchema = messageWithSenderSchema.extend({
  status: messageStatusSchema,
  optimisticId: z.string().optional(),
});

// Quick reply templates
export const quickReplyTemplateSchema = z.object({
  id: z.string(),
  text: z.string(),
  category: z.enum(['greeting', 'question', 'offer', 'unavailable', 'shipping']),
});

export const messageThreadContextSchema = z.object({
  conversationId: z.string(),
  productId: z.string(),
  otherParticipantId: z.string(),
  userRole: z.enum(['buyer', 'seller']),
});

// Type exports from schemas
export type SendMessageRequest = z.infer<typeof sendMessageRequestSchema>;
export type FetchMessagesRequest = z.infer<typeof fetchMessagesRequestSchema>;
export type CreateConversationRequest = z.infer<typeof createConversationRequestSchema>;
export type MessageEvent = z.infer<typeof messageEventSchema>;
export type TypingEvent = z.infer<typeof typingEventSchema>;
export type ConnectionStatus = z.infer<typeof connectionStatusSchema>;
export type MessageStatus = z.infer<typeof messageStatusSchema>;
export type QuickReplyTemplate = z.infer<typeof quickReplyTemplateSchema>;
export type MessageThreadContext = z.infer<typeof messageThreadContextSchema>;