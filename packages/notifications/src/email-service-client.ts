import { Resend } from 'resend';
import { log } from '@repo/observability/log';
import { OrderConfirmationEmail } from './templates/order-confirmation';
import { NewMessageEmail } from './templates/new-message';
import { PaymentReceivedEmail } from './templates/payment-received';
import { WeeklyReportEmail } from './templates/weekly-report';
import type { 
  UserRepository, 
  NotificationPreferences, 
  Order, 
  Message, 
  Conversation, 
  Payment,
  WeeklyReportData
} from './types';

interface EmailConfig {
  apiKey: string;
  fromEmail?: string;
  environment?: 'development' | 'production';
  enableDelivery?: boolean;
}

export function createEmailService(config: EmailConfig, userRepository: UserRepository) {
  const resend = new Resend(config.apiKey);
  const fromEmail = config.fromEmail || 'noreply@threadly.com';
  const environment = config.environment || 'production';
  const enableDelivery = config.enableDelivery ?? (environment === 'production');
  
  log.info('Email service initialized', {
    fromEmail,
    environment,
    deliveryEnabled: enableDelivery
  });

  return {
    async sendOrderConfirmation(order: Order) {
      try {
        const buyer = await userRepository.findById(order.buyerId);

        if (!buyer?.email) {
          log.warn('No buyer email found for order confirmation', { orderId: order.id });
          return null;
        }

        const prefs = buyer.notificationPreferences as any as NotificationPreferences;
        if (!prefs?.email?.orderUpdates) {
          log.info('User has disabled order update emails', { 
            orderId: order.id, 
            buyerEmail: buyer.email 
          });
          return null;
        }

        if (!enableDelivery) {
          log.info('Email delivery disabled - would send order confirmation', {
            orderId: order.id,
            to: buyer.email,
            environment
          });
          return { id: 'mock-email-id', environment };
        }

        const { data, error } = await resend.emails.send({
          from: fromEmail,
          to: buyer.email,
          subject: `Order Confirmed - #${order.id}`,
          react: OrderConfirmationEmail({
            orderId: order.id,
            buyerName: buyer.firstName || 'Customer',
            items: order.items,
            total: order.total,
            estimatedDelivery: order.estimatedDelivery,
          }) as any,
          tags: [
            { name: 'type', value: 'order-confirmation' },
            { name: 'environment', value: environment }
          ]
        });

        if (error) {
          log.error('Failed to send order confirmation email', { 
            error, 
            orderId: order.id,
            buyerEmail: buyer.email 
          });
          throw error;
        }

        log.info('Order confirmation email sent successfully', {
          orderId: order.id,
          emailId: data?.id,
          to: buyer.email
        });

        return data;
      } catch (error) {
        log.error('Error in sendOrderConfirmation', { error, orderId: order.id });
        throw error;
      }
    },

    async sendNewMessageNotification(message: Message, conversation: Conversation) {
      const recipientId = message.senderId === conversation.buyerId 
        ? conversation.sellerId 
        : conversation.buyerId;

      const [recipient, sender] = await Promise.all([
        userRepository.findById(recipientId),
        userRepository.findById(message.senderId),
      ]);

      if (!recipient?.email) return;

      const prefs = recipient.notificationPreferences as any as NotificationPreferences;
      if (!prefs?.email?.newMessages) return;

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: recipient.email,
        subject: `New message from ${sender?.firstName}`,
        react: NewMessageEmail({
          recipientName: recipient.firstName || 'User',
          senderName: `${sender?.firstName || ''} ${sender?.lastName || ''}`.trim(),
          messagePreview: message.content.substring(0, 100),
          conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.threadly.com'}/messages/${conversation.id}`,
        }) as any,
      });

      if (error) {
        log.error('Failed to send new message notification', { error });
      }

      return data;
    },

    async sendPaymentReceived(payment: Payment, order: Order) {
      const seller = await userRepository.findById(order.sellerId);

      if (!seller?.email) return;

      const prefs = seller.notificationPreferences as any as NotificationPreferences;
      if (!prefs?.email?.paymentReceived) return;

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: seller.email,
        subject: `Payment Received - ${payment.amount}`,
        react: PaymentReceivedEmail({
          sellerName: seller.firstName || 'Seller',
          amount: payment.amount,
          orderId: order.id,
          productName: order.items[0]?.product?.title || 'Product',
          payoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        }) as any,
      });

      if (error) {
        log.error('Failed to send payment received email', { error });
      }

      return data;
    },

    async sendWeeklyReport(sellerId: string, reportData: WeeklyReportData) {
      const seller = await userRepository.findById(sellerId);

      if (!seller?.email) return;

      const prefs = seller.notificationPreferences as any as NotificationPreferences;
      if (!prefs?.email?.weeklyReport) return;

      const { data, error } = await resend.emails.send({
        from: fromEmail,
        to: seller.email,
        subject: 'Your Weekly Threadly Report',
        react: WeeklyReportEmail({
          sellerName: seller.firstName || 'Seller',
          weekStartDate: reportData.weekStartDate,
          weekEndDate: reportData.weekEndDate,
          totalSales: reportData.totalSales,
          totalRevenue: reportData.totalRevenue,
          totalViews: reportData.totalViews,
          totalMessages: reportData.totalMessages,
          topProducts: reportData.topProducts,
        }) as any,
      });

      if (error) {
        log.error('Failed to send weekly report email', { error });
      }

      return data;
    },

    async sendBulkEmail(recipients: string[], subject: string, content: React.ReactElement) {
      const emails = recipients.map(to => ({
        from: fromEmail,
        to,
        subject,
        react: content as any,
      }));

      const { data, error } = await resend.batch.send(emails);

      if (error) {
        log.error('Failed to send bulk emails', { error });
      }

      return data;
    }
  };
}

export type EmailServiceClient = ReturnType<typeof createEmailService>;