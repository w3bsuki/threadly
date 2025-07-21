import { database } from '@repo/database';
import { getPusherServer } from './pusher-server';
import type { NotificationEvent, NotificationPreferences } from '../types';

export interface EmailNotification {
  to: string;
  subject: string;
  template: string;
  data: Record<string, any>;
}

export class NotificationService {
  private pusherServer: any;

  // Create and send in-app notification
  async notify(userId: string, notification: Omit<NotificationEvent['data'], 'id' | 'userId' | 'createdAt' | 'read'>) {
    // Save to database
    const savedNotification = await database.notification.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type.toUpperCase() as any,
        metadata: JSON.stringify(notification.metadata || {}),
        read: false,
      },
    });

    // Send real-time notification if Pusher is configured
    try {
      if (!this.pusherServer) {
        // Try to initialize if environment variables are available
        if (process.env.PUSHER_APP_ID && process.env.PUSHER_SECRET) {
          this.pusherServer = getPusherServer({
            pusherKey: process.env.NEXT_PUBLIC_PUSHER_KEY!,
            pusherCluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
            pusherAppId: process.env.PUSHER_APP_ID!,
            pusherSecret: process.env.PUSHER_SECRET!,
          });
        }
      }

      if (this.pusherServer) {
        await this.pusherServer.sendNotification(userId, {
          id: savedNotification.id,
          userId,
          title: notification.title,
          message: notification.message,
          type: notification.type as any,
          metadata: notification.metadata,
          read: false,
          createdAt: savedNotification.createdAt,
        });
      }
    } catch (error) {
      // Continue without real-time notification
    }

    return savedNotification;
  }

  // Get user notification preferences
  async getPreferences(userId: string): Promise<NotificationPreferences> {
    const user = await database.user.findUnique({
      where: { id: userId },
      select: { notificationPreferences: true },
    });

    // Default preferences if not set
    return (user?.notificationPreferences as unknown as NotificationPreferences) || {
      email: {
        orderUpdates: true,
        newMessages: true,
        paymentReceived: true,
        weeklyReport: true,
        marketing: false,
      },
      push: {
        orderUpdates: true,
        newMessages: true,
        paymentReceived: true,
      },
      inApp: {
        orderUpdates: true,
        newMessages: true,
        paymentReceived: true,
        systemAlerts: true,
      },
    };
  }

  // Update notification preferences
  async updatePreferences(userId: string, preferences: Partial<NotificationPreferences>) {
    return database.user.update({
      where: { id: userId },
      data: {
        notificationPreferences: preferences as any,
      },
    });
  }

  // Mark notification as read
  async markAsRead(notificationId: string, userId: string) {
    return database.notification.update({
      where: {
        id: notificationId,
        userId,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  // Mark all notifications as read
  async markAllAsRead(userId: string) {
    return database.notification.updateMany({
      where: {
        userId,
        read: false,
      },
      data: {
        read: true,
        readAt: new Date(),
      },
    });
  }

  // Get unread count
  async getUnreadCount(userId: string): Promise<number> {
    return database.notification.count({
      where: {
        userId,
        read: false,
      },
    });
  }

  // Send notification for new order
  async notifyNewOrder(order: any) {
    const [buyerNotif, sellerNotif] = await Promise.all([
      // Notify buyer
      this.notify(order.buyerId, {
        title: 'Order Confirmed',
        message: `Your order #${order.id} has been confirmed`,
        type: 'order',
        metadata: { orderId: order.id },
      }),
      
      // Notify seller
      this.notify(order.sellerId, {
        title: 'New Order Received',
        message: `You have a new order #${order.id}`,
        type: 'order',
        metadata: { orderId: order.id },
      }),
    ]);

    return { buyerNotif, sellerNotif };
  }

  // Send notification for new message
  async notifyNewMessage(message: any, conversation: any) {
    const recipientId = message.senderId === conversation.buyerId 
      ? conversation.sellerId 
      : conversation.buyerId;

    const sender = await database.user.findUnique({
      where: { id: message.senderId },
      select: { firstName: true, lastName: true },
    });

    return this.notify(recipientId, {
      title: 'New Message',
      message: `${sender?.firstName} sent you a message`,
      type: 'message',
      metadata: { 
        conversationId: conversation.id,
        messageId: message.id,
      },
    });
  }

  // Send notification for payment received
  async notifyPaymentReceived(payment: any) {
    const order = await database.order.findUnique({
      where: { id: payment.orderId },
      include: {
        Product: true,
      },
    });

    if (!order) return;

    return this.notify(order.sellerId, {
      title: 'Payment Received',
      message: `You received ${payment.amount} for order #${order.id}`,
      type: 'payment',
      metadata: {
        orderId: order.id,
        amount: payment.amount,
        paymentId: payment.id,
      },
    });
  }

  // Schedule weekly seller report
  async scheduleWeeklyReports() {
    // This would be implemented with a cron job
    // For now, it's a placeholder
  }
}

// Singleton instance
let notificationService: NotificationService | null = null;

export function getNotificationService(): NotificationService {
  if (!notificationService) {
    notificationService = new NotificationService();
  }
  return notificationService;
}