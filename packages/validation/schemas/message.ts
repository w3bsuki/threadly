/**
 * Message validation schemas
 */

import { z } from 'zod';
import { 
  safeTextSchema, 
  uuidSchema, 
  cuidSchema,
  imageFileSchema,
} from './common';

// Message types
export const messageTypeSchema = z.enum([
  'TEXT',
  'IMAGE',
  'PRODUCT_LINK',
  'OFFER',
  'SYSTEM',
], {
  message: 'Invalid message type',
});

// Conversation status
export const conversationStatusSchema = z.enum([
  'ACTIVE',
  'ARCHIVED',
  'BLOCKED',
  'DELETED',
], {
  message: 'Invalid conversation status',
});

// Message content validation (with profanity filter applied later)
export const messageContentSchema = z
  .string()
  .trim()
  .min(1, 'Message cannot be empty')
  .max(1000, 'Message must be at most 1000 characters')
  .refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  });

// Create message schema
export const createMessageSchema = z.object({
  conversationId: cuidSchema.optional(), // Optional for new conversations
  recipientId: uuidSchema,
  productId: cuidSchema.optional(), // Optional product reference
  
  type: messageTypeSchema.default('TEXT'),
  content: messageContentSchema,
  
  attachments: z.array(z.object({
    url: z.string().url(),
    type: z.enum(['IMAGE', 'FILE']),
    name: z.string().max(255),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
  })).max(5).optional(),
});

// Offer message schema
export const createOfferMessageSchema = z.object({
  conversationId: cuidSchema,
  productId: cuidSchema,
  offerAmount: z.number()
    .positive('Offer must be positive')
    .multipleOf(0.01, 'Offer must have at most 2 decimal places'),
  message: messageContentSchema.optional(),
});

// Update message schema (for editing)
export const updateMessageSchema = z.object({
  messageId: cuidSchema,
  content: messageContentSchema,
  edited: z.literal(true),
});

// Delete message schema
export const deleteMessageSchema = z.object({
  messageId: cuidSchema,
});

// Mark as read schema
export const markAsReadSchema = z.object({
  conversationId: cuidSchema,
  messageIds: z.array(cuidSchema).optional(), // Optional - if not provided, mark all as read
});

// Conversation filter schema
export const conversationFilterSchema = z.object({
  status: conversationStatusSchema.optional(),
  hasUnread: z.boolean().optional(),
  productId: cuidSchema.optional(),
  participantId: uuidSchema.optional(),
});

// Report message schema
export const reportMessageSchema = z.object({
  messageId: cuidSchema,
  reason: z.enum([
    'SPAM',
    'HARASSMENT',
    'INAPPROPRIATE',
    'SCAM',
    'OTHER',
  ]),
  description: z.string().trim().min(1).max(500).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
});

// Block conversation schema
export const blockConversationSchema = z.object({
  conversationId: cuidSchema,
  blockUserId: uuidSchema,
  reason: z.string().trim().min(1).max(200).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }).optional(),
});

// Typing indicator schema
export const typingIndicatorSchema = z.object({
  conversationId: cuidSchema,
  isTyping: z.boolean(),
});

// Message reaction schema
export const messageReactionSchema = z.object({
  messageId: cuidSchema,
  emoji: z.enum(['👍', '❤️', '😊', '😮', '😢', '👎']),
});

// Conversation settings schema
export const conversationSettingsSchema = z.object({
  conversationId: cuidSchema,
  notifications: z.boolean().default(true),
  archived: z.boolean().default(false),
});

// Automated message templates
export const messageTemplateSchema = z.object({
  name: z.string().trim().min(1).max(50).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
  content: messageContentSchema,
  category: z.enum([
    'GREETING',
    'UNAVAILABLE',
    'SHIPPING_INFO',
    'PAYMENT_INFO',
    'CUSTOM',
  ]),
});

// Quick reply schema
export const quickReplySchema = z.object({
  conversationId: cuidSchema,
  template: z.enum([
    'INTERESTED',
    'NEED_MORE_INFO',
    'MAKE_OFFER',
    'NOT_INTERESTED',
    'SOLD',
  ]),
});

// Message search schema
export const messageSearchSchema = z.object({
  query: z.string().trim().min(1).max(100).refine((text) => !/<[^>]*>/.test(text), {
    message: 'HTML tags are not allowed',
  }),
  conversationId: cuidSchema.optional(),
  senderId: uuidSchema.optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
});

// Bulk message operations
export const bulkMessageOperationSchema = z.object({
  messageIds: z.array(cuidSchema).min(1).max(100),
  operation: z.enum(['DELETE', 'MARK_READ', 'MARK_UNREAD']),
});

// Type exports
export type CreateMessage = z.infer<typeof createMessageSchema>;
export type CreateOfferMessage = z.infer<typeof createOfferMessageSchema>;
export type MessageType = z.infer<typeof messageTypeSchema>;
export type ConversationStatus = z.infer<typeof conversationStatusSchema>;
export type MessageTemplate = z.infer<typeof messageTemplateSchema>;
export type MessageReaction = z.infer<typeof messageReactionSchema>;