import Pusher from 'pusher';
import type { RealTimeConfig, MessageEvent, NotificationEvent, TypingEvent } from '../types';
import type { ConversationRepository, UserRepository } from '../repositories';

export function createPusherServer(
  config: RealTimeConfig,
  repositories: {
    conversationRepository: ConversationRepository;
    userRepository: UserRepository;
  }
) {
  if (!config.pusherAppId || !config.pusherSecret) {
    throw new Error('PusherServer requires appId and secret');
  }

  const pusher = new Pusher({
    appId: config.pusherAppId,
    key: config.pusherKey,
    secret: config.pusherSecret,
    cluster: config.pusherCluster,
    useTLS: true,
  });

  return {
    // Authenticate user for private/presence channels
    async authenticateUser(socketId: string, channel: string, userId: string) {
      // Verify user has access to this channel
      if (channel.startsWith('private-conversation-')) {
        const conversationId = channel.replace('private-conversation-', '');
        const hasAccess = await verifyConversationAccess(
          repositories.conversationRepository,
          userId,
          conversationId
        );
        
        if (!hasAccess) {
          throw new Error('Unauthorized access to conversation');
        }
      }

      // For presence channels, include user data
      if (channel.startsWith('presence-')) {
        const user = await repositories.userRepository.findByClerkId(userId);

        if (!user) {
          throw new Error('User not found');
        }

        return pusher.authorizeChannel(socketId, channel, {
          user_id: userId,
          user_info: {
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            avatar: user.imageUrl,
          },
        });
      }

      // Standard private channel auth
      return pusher.authorizeChannel(socketId, channel);
    },

    // Send a message event
    async sendMessage(message: MessageEvent['data']) {
      // Send to conversation channel for real-time updates
      const conversationChannel = `private-conversation-${message.conversationId}`;
      await pusher.trigger(conversationChannel, 'new-message', message);
      
      // Also get conversation to send notification to recipient's user channel
      const conversation = await repositories.conversationRepository.findById(message.conversationId);
      
      if (conversation) {
        // Determine recipient (the user who didn't send the message)
        const recipientId = message.senderId === conversation.buyerId 
          ? conversation.sellerId 
          : conversation.buyerId;
        
        // Send notification to recipient's user channel for updating conversation list
        const userChannel = `private-user-${recipientId}`;
        await pusher.trigger(userChannel, 'new-message-notification', {
          conversationId: message.conversationId,
          senderId: message.senderId,
          createdAt: message.createdAt
        });
      }
    },

    // Send typing indicator
    async sendTypingIndicator(data: TypingEvent['data']) {
      const channel = `private-conversation-${data.conversationId}`;
      await pusher.trigger(channel, 'typing', data);
    },

    // Send notification
    async sendNotification(userId: string, notification: NotificationEvent['data']) {
      const channel = `private-user-${userId}`;
      await pusher.trigger(channel, 'new-notification', notification);
    },

    // Broadcast to multiple channels
    async broadcast(channels: string[], event: string, data: any) {
      await pusher.trigger(channels, event, data);
    },

    // Get channel info
    async getChannelInfo(channel: string) {
      return pusher.get({ path: `/channels/${channel}` });
    },

    // Get presence channel users
    async getPresenceUsers(channel: string) {
      return pusher.get({ path: `/channels/${channel}/users` });
    },

    // Trigger batch events
    async triggerBatch(batch: Array<{ channel: string; event: string; data: any }>) {
      const triggers = batch.map(({ channel, event, data }) => ({
        channel,
        name: event,
        data: JSON.stringify(data),
      }));

      await pusher.triggerBatch(triggers);
    }
  };
}

// Helper function to verify conversation access
async function verifyConversationAccess(
  conversationRepo: ConversationRepository,
  userId: string,
  conversationId: string
): Promise<boolean> {
  const conversation = await conversationRepo.findByUserAccess(conversationId, userId);
  return !!conversation;
}

export type PusherServerClient = ReturnType<typeof createPusherServer>;