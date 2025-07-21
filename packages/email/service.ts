import { resend } from './index';
import { keys } from './keys';
import { WelcomeTemplate } from './templates/welcome';
import { OrderConfirmationTemplate } from './templates/order-confirmation';
import { OrderShippedTemplate } from './templates/order-shipped';
import { ContactTemplate } from './templates/contact';

const env = keys();

export interface EmailOptions {
  to: string;
  subject: string;
  from?: string;
}

export interface WelcomeEmailData {
  firstName: string;
  dashboardUrl?: string;
  browseUrl?: string;
}

export interface OrderConfirmationEmailData {
  firstName: string;
  orderId: string;
  productTitle: string;
  productImage?: string;
  price: number;
  sellerName: string;
  orderUrl?: string;
}

export interface OrderShippedEmailData {
  firstName: string;
  orderId: string;
  productTitle: string;
  productImage?: string;
  sellerName: string;
  trackingNumber: string;
  trackingUrl?: string;
  orderUrl?: string;
  estimatedDelivery?: string;
}

export interface ContactEmailData {
  name: string;
  email: string;
  message: string;
}

/**
 * Send welcome email to new users
 */
export async function sendWelcomeEmail(
  to: string,
  data: WelcomeEmailData
) {
  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to,
      subject: `Welcome to Threadly, ${data.firstName}! 🎉`,
      react: WelcomeTemplate(data),
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send order confirmation email to buyers
 */
export async function sendOrderConfirmationEmail(
  to: string,
  data: OrderConfirmationEmailData
) {
  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to,
      subject: `Order Confirmed - #${data.orderId} | Threadly`,
      react: OrderConfirmationTemplate(data),
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send shipping notification email to buyers
 */
export async function sendOrderShippedEmail(
  to: string,
  data: OrderShippedEmailData
) {
  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to,
      subject: `Your order #${data.orderId} has shipped! 📦`,
      react: OrderShippedTemplate(data),
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send contact form email to support
 */
export async function sendContactEmail(
  data: ContactEmailData
) {
  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to: 'support@threadly.com', // Support email
      subject: `New Contact Form Submission from ${data.name}`,
      react: ContactTemplate(data),
      replyTo: data.email,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Send a test email to verify Resend configuration
 */
export async function sendTestEmail(to: string) {
  try {
    const result = await resend.emails.send({
      from: env.RESEND_FROM,
      to,
      subject: 'Threadly Email Service Test',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333;">✅ Email Service Working!</h1>
          <p>This is a test email from your Threadly email service.</p>
          <p>If you're receiving this, your Resend integration is configured correctly.</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            Sent from Threadly Email Service<br>
            Time: ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}

/**
 * Get email service status
 */
export function getEmailServiceStatus() {
  return {
    configured: !!(env.RESEND_TOKEN && env.RESEND_FROM),
    from: env.RESEND_FROM,
    provider: 'Resend',
  };
}

// Export everything for easy imports
export {
  WelcomeTemplate,
  OrderConfirmationTemplate,
  OrderShippedTemplate,
  ContactTemplate,
};