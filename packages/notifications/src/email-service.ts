// DEPRECATED: This file is kept for backward compatibility only
// DO NOT USE IN NEW CODE - use createEmailService from email-service-client instead
// This file will be removed in the next major version

import * as React from 'react';
import { Resend } from 'resend';
import { database } from '@repo/database';
import { log } from '@repo/observability/log';
import { OrderConfirmationEmail } from './templates/order-confirmation';
import { NewMessageEmail } from './templates/new-message';
import { PaymentReceivedEmail } from './templates/payment-received';
import { WeeklyReportEmail } from './templates/weekly-report';

interface NotificationPreferences {
  email: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
    weeklyReport: boolean;
    marketing: boolean;
  };
  push: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
  };
  inApp: {
    orderUpdates: boolean;
    newMessages: boolean;
    paymentReceived: boolean;
    systemAlerts: boolean;
  };
}

interface EmailConfig {
  apiKey: string;
  fromEmail?: string;
  environment?: 'development' | 'production';
  enableDelivery?: boolean;
}

export class EmailService {
  private resend: Resend;
  private fromEmail: string;
  private environment: 'development' | 'production';
  private enableDelivery: boolean;

  constructor(config: EmailConfig) {
    this.resend = new Resend(config.apiKey);
    this.fromEmail = config.fromEmail || 'noreply@threadly.com';
    this.environment = config.environment || 'production';
    this.enableDelivery = config.enableDelivery ?? (this.environment === 'production');
    
    log.info('Email service initialized', {
      fromEmail: this.fromEmail,
      environment: this.environment,
      deliveryEnabled: this.enableDelivery
    });
  }

  // Send order confirmation email
  async sendOrderConfirmation(order: any) {
    try {
      const buyer = await database.user.findUnique({
        where: { id: order.buyerId },
        select: { email: true, firstName: true, notificationPreferences: true },
      });

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

      if (!this.enableDelivery) {
        log.info('Email delivery disabled - would send order confirmation', {
          orderId: order.id,
          to: buyer.email,
          environment: this.environment
        });
        return { id: 'mock-email-id', environment: this.environment };
      }

      const { data, error } = await this.resend.emails.send({
        from: this.fromEmail,
        to: buyer.email,
        subject: `Order Confirmed - #${order.id}`,
        react: OrderConfirmationEmail({
          orderId: order.id,
          buyerName: buyer.firstName || 'Customer',
          items: order.items,
          total: order.total,
          estimatedDelivery: order.estimatedDelivery,
        }),
        tags: [
          { name: 'type', value: 'order-confirmation' },
          { name: 'environment', value: this.environment }
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
  }

  // Send new message notification
  async sendNewMessageNotification(message: any, conversation: any) {
    const recipientId = message.senderId === conversation.buyerId 
      ? conversation.sellerId 
      : conversation.buyerId;

    const [recipient, sender] = await Promise.all([
      database.user.findUnique({
        where: { id: recipientId },
        select: { email: true, firstName: true, notificationPreferences: true },
      }),
      database.user.findUnique({
        where: { id: message.senderId },
        select: { firstName: true, lastName: true },
      }),
    ]);

    if (!recipient?.email) return;

    const prefs = recipient.notificationPreferences as any as NotificationPreferences;
    if (!prefs?.email?.newMessages) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: recipient.email,
      subject: `New message from ${sender?.firstName}`,
      react: NewMessageEmail({
        recipientName: recipient.firstName || 'User',
        senderName: `${sender?.firstName} ${sender?.lastName}`.trim(),
        messagePreview: message.content.substring(0, 100),
        conversationUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://app.threadly.com'}/messages/${conversation.id}`,
      }),
    });

    if (error) {
      // TODO: Add proper error tracking service and retry mechanism
    }

    return data;
  }

  // Send payment received notification
  async sendPaymentReceived(payment: any, order: any) {
    const seller = await database.user.findUnique({
      where: { id: order.sellerId },
      select: { email: true, firstName: true, notificationPreferences: true },
    });

    if (!seller?.email) return;

    const prefs = seller.notificationPreferences as any as NotificationPreferences;
    if (!prefs?.email?.paymentReceived) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
      to: seller.email,
      subject: `Payment Received - ${payment.amount}`,
      react: PaymentReceivedEmail({
        sellerName: seller.firstName || 'Seller',
        amount: payment.amount,
        orderId: order.id,
        productName: order.items[0]?.product?.title || 'Product',
        payoutDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      }),
    });

    if (error) {
    }

    return data;
  }

  // Send weekly seller report
  async sendWeeklyReport(sellerId: string, reportData: any) {
    const seller = await database.user.findUnique({
      where: { id: sellerId },
      select: { email: true, firstName: true, notificationPreferences: true },
    });

    if (!seller?.email) return;

    const prefs = seller.notificationPreferences as any as NotificationPreferences;
    if (!prefs?.email?.weeklyReport) return;

    const { data, error } = await this.resend.emails.send({
      from: this.fromEmail,
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
      }),
    });

    if (error) {
    }

    return data;
  }

  // Send bulk emails (for marketing campaigns)
  async sendBulkEmail(recipients: string[], subject: string, content: React.ReactElement) {
    const emails = recipients.map(to => ({
      from: this.fromEmail,
      to,
      subject,
      react: content,
    }));

    const { data, error } = await this.resend.batch.send(emails);

    if (error) {
    }

    return data;
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(config?: EmailConfig): EmailService {
  if (!emailService && config) {
    emailService = new EmailService(config);
  }
  
  if (!emailService) {
    throw new Error('EmailService not initialized. Provide configuration first.');
  }
  
  return emailService;
}

// Factory function for production setup
export function createProductionEmailService(apiKey: string, fromEmail?: string): EmailService {
  return new EmailService({
    apiKey,
    fromEmail,
    environment: 'production',
    enableDelivery: true
  });
}

// Factory function for development setup
export function createDevelopmentEmailService(apiKey?: string): EmailService {
  return new EmailService({
    apiKey: apiKey || 'mock-api-key',
    fromEmail: 'dev@threadly.com',
    environment: 'development',
    enableDelivery: false // Don't send real emails in development
  });
}