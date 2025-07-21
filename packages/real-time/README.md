# @repo/real-time

Real-time communication infrastructure for Threadly's C2C fashion marketplace. This package provides WebSocket-based real-time features using Pusher, including messaging, notifications, typing indicators, and presence awareness.

## Overview

The real-time package enables live communication features throughout Threadly:

- **Real-time Messaging**: Instant message delivery between buyers and sellers
- **Typing Indicators**: Show when users are composing messages
- **Push Notifications**: Real-time notifications for orders, messages, and updates
- **Presence Awareness**: Track user online/offline status
- **Channel Management**: Organized communication channels for different features
- **React Integration**: Custom hooks for easy React integration
- **TypeScript Support**: Full type safety for all real-time events

## Installation

```bash
pnpm add @repo/real-time
```

## Setup & Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Pusher Configuration
NEXT_PUBLIC_PUSHER_KEY=your_pusher_app_key
NEXT_PUBLIC_PUSHER_CLUSTER=your_cluster
PUSHER_APP_ID=your_app_id
PUSHER_SECRET=your_pusher_secret

# Optional: Custom Pusher host
NEXT_PUBLIC_PUSHER_HOST=your-custom-host.com
```

### Provider Setup

Wrap your app with the real-time provider:

```typescript
// app/layout.tsx
import { RealTimeProvider } from '@repo/real-time/client';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <RealTimeProvider
          config={{
            pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
            pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            enablePresence: true,
            enableTypingIndicators: true
          }}
        >
          {children}
        </RealTimeProvider>
      </body>
    </html>
  );
}
```

## Dependencies

This package depends on:
- `pusher` - Pusher server SDK
- `pusher-js` - Pusher client SDK
- `react` - React framework
- Database models for users, conversations, notifications

## API Reference

### Client-Side Hooks

```typescript
import { 
  useChannel, 
  usePresence, 
  useTypingIndicator, 
  useNotifications, 
  useConnectionState 
} from '@repo/real-time/client';

// Subscribe to channels
const { isSubscribed, bind, trigger } = useChannel('private-conversation-123');

// Track user presence
const { members, count } = usePresence('presence-product-123');

// Typing indicators
const { typingUsers, sendTyping } = useTypingIndicator('conversation-123');

// Real-time notifications
const { notifications, unreadCount, markAsRead } = useNotifications();

// Connection monitoring
const { isConnected, state } = useConnectionState();
```

### Server-Side Functions

```typescript
import { createPusherServer } from '@repo/real-time/server';

// Create Pusher server instance
const pusherServer = createPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!
});

// Send notifications
await pusherServer.sendNotification({
  userId: 'user_123',
  title: 'Order Update',
  message: 'Your order has been shipped!',
  type: 'order',
  metadata: { orderId: 'order_456' }
});

// Send messages
await pusherServer.sendMessage({
  id: 'msg_123',
  conversationId: 'conv_456',
  senderId: 'user_789',
  content: 'Hello!',
  createdAt: new Date()
});
```

## Usage Examples

### Real-time Messaging

```typescript
// components/MessageThread.tsx
import { useChannel, useTypingIndicator } from '@repo/real-time/client';
import { useEffect, useState } from 'react';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
}

function MessageThread({ conversationId }: { conversationId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const { bind } = useChannel(`private-conversation-${conversationId}`);
  const { typingUsers, sendTyping } = useTypingIndicator(conversationId);

  // Listen for new messages
  useEffect(() => {
    const unsubscribe = bind('new-message', (data: Message) => {
      setMessages(prev => [...prev, data]);
    });

    return unsubscribe;
  }, [bind]);

  // Handle typing events
  const handleTypingStart = () => {
    sendTyping(true);
  };

  const handleTypingStop = () => {
    sendTyping(false);
  };

  return (
    <div className="message-thread">
      <div className="messages">
        {messages.map(message => (
          <MessageBubble key={message.id} message={message} />
        ))}
        
        {typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
      </div>
      
      <MessageInput
        onTypingStart={handleTypingStart}
        onTypingStop={handleTypingStop}
        onSendMessage={handleSendMessage}
      />
    </div>
  );
}
```

### Live Notifications

```typescript
// components/NotificationBell.tsx
import { useNotifications } from '@repo/real-time/client';
import { useState } from 'react';

function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="notification-bell">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-gray-100"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border">
          <div className="p-4 border-b flex justify-between items-center">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-blue-600 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No notifications
              </div>
            ) : (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={() => markAsRead(notification.id)}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
```

### User Presence

```typescript
// components/UserPresence.tsx
import { usePresence } from '@repo/real-time/client';

function ProductPage({ productId }: { productId: string }) {
  const { members, count } = usePresence(`presence-product-${productId}`);

  return (
    <div className="product-page">
      <div className="product-details">
        {/* Product content */}
      </div>
      
      <div className="presence-indicator">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="flex -space-x-1">
            {Array.from(members.values()).slice(0, 3).map((member, index) => (
              <div
                key={member.id}
                className="w-6 h-6 rounded-full bg-green-500 border-2 border-white"
                title={member.name}
              />
            ))}
          </div>
          <span>
            {count === 1 ? '1 person' : `${count} people`} viewing
          </span>
        </div>
      </div>
    </div>
  );
}
```

### Connection Status

```typescript
// components/ConnectionStatus.tsx
import { useConnectionState } from '@repo/real-time/client';

function ConnectionStatus() {
  const { state, isConnected, isConnecting, isDisconnected } = useConnectionState();

  if (isConnected) return null; // Don't show when connected

  return (
    <div className={`fixed top-4 right-4 px-4 py-2 rounded-lg text-white text-sm ${
      isConnecting ? 'bg-yellow-500' : 'bg-red-500'
    }`}>
      {isConnecting && (
        <span className="flex items-center">
          <Spinner className="w-4 h-4 mr-2" />
          Connecting...
        </span>
      )}
      {isDisconnected && (
        <span>Disconnected - Some features may not work</span>
      )}
    </div>
  );
}
```

### Server-Side Message Broadcasting

```typescript
// app/api/messages/route.ts
import { createPusherServer } from '@repo/real-time/server';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

const pusherServer = createPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!
});

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { conversationId, content } = await request.json();

  // Save message to database
  const message = await database.message.create({
    data: {
      conversationId,
      senderId: userId,
      content,
      read: false
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true
        }
      }
    }
  });

  // Broadcast to conversation participants
  await pusherServer.sendMessage({
    id: message.id,
    conversationId: message.conversationId,
    senderId: message.senderId,
    content: message.content,
    createdAt: message.createdAt
  });

  return Response.json({ success: true, message });
}
```

### Order Status Updates

```typescript
// app/api/orders/[id]/status/route.ts
import { createPusherServer } from '@repo/real-time/server';
import { database } from '@repo/database';

const pusherServer = createPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!
});

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { status } = await request.json();

  const order = await database.order.update({
    where: { id: params.id },
    data: { status },
    include: {
      buyer: true,
      product: true
    }
  });

  // Send real-time notification to buyer
  await pusherServer.sendNotification({
    userId: order.buyerId,
    title: 'Order Update',
    message: `Your order for ${order.product.title} has been ${status.toLowerCase()}`,
    type: 'order',
    metadata: {
      orderId: order.id,
      status: order.status
    }
  });

  return Response.json({ success: true, order });
}
```

### Channel Authentication

```typescript
// app/api/pusher/auth/route.ts
import { createPusherServer } from '@repo/real-time/server';
import { auth } from '@repo/auth/server';

const pusherServer = createPusherServer({
  pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  pusherAppId: process.env.PUSHER_APP_ID!,
  pusherSecret: process.env.PUSHER_SECRET!
});

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const socketId = formData.get('socket_id') as string;
  const channel = formData.get('channel_name') as string;

  // Validate user access to channel
  if (channel.startsWith('private-conversation-')) {
    const conversationId = channel.replace('private-conversation-', '');
    
    // Check if user is participant in conversation
    const conversation = await database.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      }
    });

    if (!conversation) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }
  }

  // User-specific private channels
  if (channel === `private-user-${userId}`) {
    const authResponse = pusherServer.authorizeChannel(socketId, channel);
    return Response.json(authResponse);
  }

  return Response.json({ error: 'Unauthorized channel' }, { status: 403 });
}
```

## Event Types

### Message Events

```typescript
type MessageEvent = {
  type: 'message';
  data: {
    id: string;
    conversationId: string;
    senderId: string;
    content: string;
    createdAt: Date;
  };
};
```

### Typing Events

```typescript
type TypingEvent = {
  type: 'typing';
  data: {
    conversationId: string;
    userId: string;
    isTyping: boolean;
  };
};
```

### Notification Events

```typescript
type NotificationEvent = {
  type: 'notification';
  data: {
    id: string;
    userId: string;
    title: string;
    message: string;
    type: 'order' | 'message' | 'payment' | 'system';
    metadata?: Record<string, any>;
    read: boolean;
    createdAt: Date;
  };
};
```

### Presence Events

```typescript
type PresenceEvent = {
  type: 'presence';
  data: {
    userId: string;
    status: 'online' | 'offline' | 'away';
    lastSeen?: Date;
  };
};
```

## Channel Naming Conventions

### Private Channels (Authenticated)
- `private-conversation-{conversationId}` - Messages between specific users
- `private-user-{userId}` - User-specific notifications
- `private-order-{orderId}` - Order status updates

### Presence Channels (User tracking)
- `presence-product-{productId}` - Users viewing a product
- `presence-category-{categoryId}` - Users browsing a category
- `presence-search-{query}` - Users with similar searches

### Public Channels (No auth required)
- `global-announcements` - Platform-wide announcements
- `status-updates` - Service status updates

## Configuration

### Custom Pusher Configuration

```typescript
const customConfig: RealTimeConfig = {
  pusherKey: 'your-key',
  pusherCluster: 'your-cluster',
  enablePresence: true,
  enableTypingIndicators: true,
  // Additional Pusher options
  wsHost: 'ws.pusherapp.com',
  wsPort: 80,
  wssPort: 443,
  forceTLS: true,
  enabledTransports: ['ws', 'wss']
};
```

### Environment-Specific Settings

```typescript
// Development
const devConfig = {
  ...baseConfig,
  enableLogging: true,
  cluster: 'eu' // EU cluster for GDPR compliance
};

// Production
const prodConfig = {
  ...baseConfig,
  enableLogging: false,
  activityTimeout: 120000, // 2 minutes
  pongTimeout: 30000       // 30 seconds
};
```

## Security Considerations

- **Channel Authentication**: Private channels require server-side authentication
- **User Permissions**: Verify user access to conversations and notifications
- **Rate Limiting**: Implement rate limits on message sending
- **Content Validation**: Sanitize and validate all message content
- **HTTPS Only**: Always use secure connections in production

## Performance Optimization

- **Connection Reuse**: Single WebSocket connection for all channels
- **Event Batching**: Batch multiple events when possible
- **Presence Throttling**: Limit presence updates to prevent spam
- **Channel Cleanup**: Automatically unsubscribe from unused channels
- **Memory Management**: Clean up event listeners and timeouts

## Testing

```bash
# Run real-time package tests
pnpm test packages/real-time

# Test specific modules
pnpm test packages/real-time/client
pnpm test packages/real-time/hooks
```

## Integration Notes

This package integrates with:
- Pusher for WebSocket infrastructure
- Authentication system for channel security
- Database for message and notification persistence
- Messaging package for chat functionality

## Troubleshooting

### Common Issues

1. **Connection Failed**: Check Pusher credentials and network
2. **Auth Errors**: Verify channel authentication endpoint
3. **Missing Events**: Ensure proper channel subscription
4. **Memory Leaks**: Always clean up subscriptions in useEffect

### Debug Mode

```typescript
// Enable debug logging
const debugConfig = {
  ...config,
  enableLogging: true,
  logToConsole: true
};
```

## Version History

- `0.0.0` - Initial release with Pusher integration
- Real-time messaging and notifications
- Typing indicators and presence awareness
- React hooks for easy integration
- Channel authentication and security
- TypeScript support with event types