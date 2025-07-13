import Pusher from 'pusher';
import { database } from '@repo/database';
import type { RealTimeConfig, MessageEvent, NotificationEvent, TypingEvent } from '../types';

export class PusherServer {
  private pusher: Pusher;

  constructor(config: RealTimeConfig) {
    if (!config.pusherAppId || !config.pusherSecret) {
      throw new Error('PusherServer requires appId and secret');
    }

    this.pusher = new Pusher({
      appId: config.pusherAppId,
      key: config.pusherKey,
      secret: config.pusherSecret,
      cluster: config.pusherCluster,
      useTLS: true,
    });
  }

  // Authenticate user for private/presence channels
  async authenticateUser(socketId: string, channel: string, userId: string) {
    // Verify user has access to this channel
    if (channel.startsWith('private-conversation-')) {
      const conversationId = channel.replace('private-conversation-', '');
      const hasAccess = await this.verifyConversationAccess(userId, conversationId);
      
      if (!hasAccess) {
        throw new Error('Unauthorized access to conversation');
      }
    }

    // For presence channels, include user data
    if (channel.startsWith('presence-')) {
      const user = await database.user.findUnique({
        where: { clerkId: userId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          imageUrl: true,
        },
      });

      if (!user) {
        throw new Error('User not found');
      }

      return this.pusher.authorizeChannel(socketId, channel, {
        user_id: userId,
        user_info: {
          name: `${user.firstName} ${user.lastName}`.trim(),
          avatar: user.imageUrl,
        },
      });
    }

    // Standard private channel auth
    return this.pusher.authorizeChannel(socketId, channel);
  }

  // Send a message event
  async sendMessage(message: MessageEvent['data']) {
    // Send to conversation channel for real-time updates
    const conversationChannel = `private-conversation-${message.conversationId}`;
    await this.pusher.trigger(conversationChannel, 'new-message', message);
    
    // Also get conversation to send notification to recipient's user channel
    const conversation = await database.conversation.findUnique({
      where: { id: message.conversationId },
      select: { buyerId: true, sellerId: true }
    });
    
    if (conversation) {
      // Determine recipient (the user who didn't send the message)
      const recipientId = message.senderId === conversation.buyerId 
        ? conversation.sellerId 
        : conversation.buyerId;
      
      // Send notification to recipient's user channel for updating conversation list
      const userChannel = `private-user-${recipientId}`;
      await this.pusher.trigger(userChannel, 'new-message-notification', {
        conversationId: message.conversationId,
        senderId: message.senderId,
        createdAt: message.createdAt
      });
    }
  }

  // Send typing indicator
  async sendTypingIndicator(data: TypingEvent['data']) {
    const channel = `private-conversation-${data.conversationId}`;
    await this.pusher.trigger(channel, 'typing', data);
  }

  // Send notification
  async sendNotification(userId: string, notification: NotificationEvent['data']) {
    const channel = `private-user-${userId}`;
    await this.pusher.trigger(channel, 'new-notification', notification);
  }

  // Broadcast to multiple channels
  async broadcast(channels: string[], event: string, data: any) {
    await this.pusher.trigger(channels, event, data);
  }

  // Get channel info
  async getChannelInfo(channel: string) {
    return this.pusher.get({ path: `/channels/${channel}` });
  }

  // Get presence channel users
  async getPresenceUsers(channel: string) {
    return this.pusher.get({ path: `/channels/${channel}/users` });
  }

  // Verify user has access to conversation
  private async verifyConversationAccess(userId: string, conversationId: string): Promise<boolean> {
    const conversation = await database.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          { User_Conversation_buyerIdToUser: { clerkId: userId } },
          { User_Conversation_sellerIdToUser: { clerkId: userId } },
        ],
      },
    });

    return !!conversation;
  }

  // Trigger batch events
  async triggerBatch(batch: Array<{ channel: string; event: string; data: any }>) {
    const triggers = batch.map(({ channel, event, data }) => ({
      channel,
      name: event,
      data: JSON.stringify(data),
    }));

    await this.pusher.triggerBatch(triggers);
  }
}

// Singleton instance
let pusherServer: PusherServer | null = null;

export function getPusherServer(config?: RealTimeConfig): PusherServer {
  if (!pusherServer && config) {
    pusherServer = new PusherServer(config);
  }
  
  if (!pusherServer) {
    throw new Error('PusherServer not initialized. Call with config first.');
  }
  
  return pusherServer;
}