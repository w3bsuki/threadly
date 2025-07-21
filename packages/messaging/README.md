# @repo/messaging

Real-time messaging system for Threadly's C2C fashion marketplace. This package provides comprehensive messaging functionality for buyer-seller communication, including real-time message delivery, conversation management, and message history.

## Overview

The messaging package handles all aspects of communication between buyers and sellers in Threadly:

- **Real-time Messaging**: Instant message delivery with WebSocket support
- **Conversation Management**: Create and manage buyer-seller conversations
- **Message History**: Persistent message storage with pagination
- **Read Receipts**: Track message delivery and read status
- **Typing Indicators**: Show when users are typing
- **Quick Replies**: Pre-defined message templates for common responses
- **Image Support**: Send and receive images in messages
- **Security**: Message sanitization and access control

## Installation

```bash
pnpm add @repo/messaging
```

## Dependencies

This package depends on:
- `@repo/auth` - User authentication
- `@repo/database` - Database operations
- `@repo/real-time` - WebSocket connections
- `@repo/validation` - Input validation and sanitization
- `@repo/observability` - Logging and error tracking
- `@repo/design-system` - UI components
- `@clerk/nextjs` - Authentication provider
- `react` - React hooks and components
- `zod` - Schema validation
- `next` - Next.js framework
- `lucide-react` - Icons

## API Reference

### Server Functions

```typescript
import { 
  getMessages, 
  sendMessage, 
  createConversation, 
  getUserConversations, 
  markMessagesAsRead, 
  archiveConversation 
} from '@repo/messaging/server';

// Get messages for a conversation
const result = await getMessages(conversationId, userId, { 
  page: 1, 
  limit: 50 
});

// Send a new message
const messageResult = await sendMessage(userId, {
  conversationId: 'conv-123',
  content: 'Hello, is this item still available?',
  imageUrl: 'https://example.com/image.jpg' // optional
});

// Create a new conversation
const conversationResult = await createConversation(userId, {
  productId: 'prod-456',
  initialMessage: 'Hi! I\'m interested in this item.'
});

// Get user's conversations
const { conversations } = await getUserConversations(userId);

// Mark messages as read
await markMessagesAsRead(conversationId, userId);

// Archive a conversation
await archiveConversation(conversationId, userId);
```

### Client Hooks

```typescript
import { 
  useMessages, 
  useConversations, 
  useMessageActions, 
  useTypingIndicator, 
  useRealTimeMessages 
} from '@repo/messaging/client';

// Get messages for a conversation
const { messages, isLoading, hasMore, loadMore } = useMessages(conversationId);

// Get user's conversations
const { conversations, isLoading, refresh } = useConversations();

// Message actions
const { 
  sendMessage, 
  sendingMessage, 
  error 
} = useMessageActions(conversationId);

// Typing indicator
const { 
  isTyping, 
  startTyping, 
  stopTyping 
} = useTypingIndicator(conversationId);

// Real-time message updates
useRealTimeMessages(conversationId, {
  onNewMessage: (message) => {
    // Handle new message
  },
  onTypingStart: (userId) => {
    // Handle typing start
  },
  onTypingStop: (userId) => {
    // Handle typing stop
  }
});
```

### Components

```typescript
import { 
  MessageBubble, 
  MessageInput, 
  MessageThread, 
  TypingIndicator 
} from '@repo/messaging/components';

// Message bubble component
<MessageBubble
  message={message}
  isOwnMessage={true}
  showAvatar={true}
  showTimestamp={true}
/>

// Message input component
<MessageInput
  onSendMessage={(content, imageUrl) => {
    sendMessage({ content, imageUrl });
  }}
  placeholder="Type your message..."
  disabled={sendingMessage}
  maxLength={1000}
/>

// Full message thread
<MessageThread
  conversationId="conv-123"
  onMessageSent={(message) => {
    // Handle message sent
  }}
/>

// Typing indicator
<TypingIndicator
  isTyping={isTyping}
  typingUsers={['John Doe']}
/>
```

## Usage Examples

### Complete Messaging Interface

```typescript
import { 
  useMessages, 
  useMessageActions, 
  useTypingIndicator,
  MessageBubble,
  MessageInput,
  TypingIndicator 
} from '@repo/messaging';

function MessagingInterface({ conversationId }: { conversationId: string }) {
  const { messages, isLoading, hasMore, loadMore } = useMessages(conversationId);
  const { sendMessage, sendingMessage } = useMessageActions(conversationId);
  const { isTyping, startTyping, stopTyping } = useTypingIndicator(conversationId);

  const handleSendMessage = async (content: string, imageUrl?: string) => {
    await sendMessage({ content, imageUrl });
  };

  return (
    <div className="messaging-interface">
      {/* Message history */}
      <div className="messages-container">
        {hasMore && (
          <button onClick={loadMore} disabled={isLoading}>
            Load More Messages
          </button>
        )}
        
        {messages.map((message) => (
          <MessageBubble
            key={message.id}
            message={message}
            isOwnMessage={message.isOwnMessage}
            showAvatar={true}
            showTimestamp={true}
          />
        ))}
        
        <TypingIndicator isTyping={isTyping} />
      </div>

      {/* Message input */}
      <MessageInput
        onSendMessage={handleSendMessage}
        onTypingStart={startTyping}
        onTypingStop={stopTyping}
        disabled={sendingMessage}
        placeholder="Type your message..."
        maxLength={1000}
      />
    </div>
  );
}
```

### Conversation List

```typescript
import { useConversations } from '@repo/messaging';
import { formatMessageTime, getMessagePreview } from '@repo/messaging';

function ConversationList() {
  const { conversations, isLoading, refresh } = useConversations();

  if (isLoading) return <div>Loading conversations...</div>;

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => (
        <div key={conversation.id} className="conversation-item">
          <div className="conversation-avatar">
            <img 
              src={conversation.otherParticipant.avatar || '/default-avatar.png'} 
              alt={conversation.otherParticipant.name}
            />
          </div>
          
          <div className="conversation-content">
            <div className="conversation-header">
              <h3>{conversation.otherParticipant.name}</h3>
              <span className="conversation-time">
                {conversation.lastMessage && 
                  formatMessageTime(conversation.lastMessage.createdAt)
                }
              </span>
            </div>
            
            <div className="conversation-preview">
              <span className="product-title">{conversation.productTitle}</span>
              <span className="product-price">${conversation.productPrice}</span>
            </div>
            
            {conversation.lastMessage && (
              <div className="last-message">
                {getMessagePreview(conversation.lastMessage.content)}
              </div>
            )}
            
            {conversation.unreadCount > 0 && (
              <div className="unread-badge">
                {conversation.unreadCount}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

### API Route Example

```typescript
// app/api/messages/route.ts
import { getMessages } from '@repo/messaging/server';
import { auth } from '@repo/auth/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversationId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID required' }, { status: 400 });
    }

    const result = await getMessages(conversationId, userId, { page, limit });
    
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error('Messages API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

## Quick Reply Templates

The package includes pre-defined message templates for common scenarios:

```typescript
import { QUICK_REPLY_TEMPLATES } from '@repo/messaging';

// Greeting templates
QUICK_REPLY_TEMPLATES.GREETING = [
  'Hi! I\'m interested in this item.',
  'Hello! Is this still available?',
  'Hi there! Can you tell me more about this?',
];

// Question templates
QUICK_REPLY_TEMPLATES.QUESTION = [
  'What condition is this in?',
  'Are there any flaws or defects?',
  'Can you provide more photos?',
  'What are the measurements?',
  'Is the price negotiable?',
];

// Offer templates
QUICK_REPLY_TEMPLATES.OFFER = [
  'Would you consider $[amount]?',
  'I can offer $[amount] for this.',
  'What\'s the lowest you\'d accept?',
];
```

## Type Definitions

### Core Types

```typescript
interface MessageWithSender {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  imageUrl?: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  sender: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    imageUrl: string | null;
  };
  isOwnMessage: boolean;
}

interface ConversationWithDetails {
  id: string;
  productId: string;
  buyerId: string;
  sellerId: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: Date;
  updatedAt: Date;
  buyer: User;
  seller: User;
  product: Product;
  messages: MessageWithSender[];
}

interface ConversationListItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: string;
  otherParticipant: {
    id: string;
    name: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: Date;
    isOwnMessage: boolean;
  };
  unreadCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
  updatedAt: Date;
}
```

## Configuration

### Message Limits

```typescript
export const MESSAGE_LIMITS = {
  MAX_LENGTH: 1000,
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  SUPPORTED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  PAGINATION_LIMIT: 50,
} as const;
```

### Real-time Events

The package uses Pusher for real-time communication with these event types:

- `message.new` - New message received
- `message.read` - Message read status updated
- `typing.start` - User started typing
- `typing.stop` - User stopped typing

## Security Features

- **Message Sanitization**: All messages are sanitized before storage
- **Access Control**: Users can only access their own conversations
- **Input Validation**: All inputs are validated with Zod schemas
- **Rate Limiting**: Prevents spam and abuse
- **Content Filtering**: Removes potentially harmful content

## Testing

```bash
# Run messaging package tests
pnpm test packages/messaging

# Run specific test files
pnpm test packages/messaging/server
pnpm test packages/messaging/hooks
```

## Integration Notes

This package integrates with:
- `@repo/database` for message persistence
- `@repo/real-time` for WebSocket connections
- `@repo/auth` for user authentication
- `@repo/validation` for input sanitization
- `@repo/observability` for logging and monitoring

## Performance Considerations

- Messages are paginated to prevent loading too much data
- Real-time connections are automatically cleaned up
- Image uploads are optimized and resized
- Database queries are optimized with proper indexes

## Version History

- `0.1.0` - Initial release with core messaging functionality
- Real-time message delivery
- Conversation management
- React hooks and components
- TypeScript support