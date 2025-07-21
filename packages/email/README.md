# @repo/email

Professional email service for Threadly's C2C fashion marketplace. This package provides transactional email functionality using Resend, with beautiful React-based email templates for user onboarding, order notifications, and customer support.

## Overview

The email package handles all transactional email communications for Threadly:

- **Resend Integration**: Modern email delivery with excellent deliverability
- **React Email Templates**: Beautiful, responsive email templates built with React
- **Transactional Emails**: Welcome, order confirmations, shipping notifications
- **Template System**: Reusable, customizable email components
- **Type Safety**: Full TypeScript support with proper error handling
- **Testing Support**: Easy testing and preview capabilities

## Installation

```bash
pnpm add @repo/email
```

## Setup & Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Resend Configuration
RESEND_TOKEN=re_your_resend_api_key
RESEND_FROM=noreply@threadly.com

# Optional: Custom domain
RESEND_FROM=hello@yourdomain.com
```

### Domain Setup

1. Add your domain to Resend dashboard
2. Configure DNS records for authentication
3. Verify domain ownership
4. Update `RESEND_FROM` with your verified domain

## Dependencies

This package depends on:
- `@react-email/components` - React email component library
- `@t3-oss/env-nextjs` - Environment variable validation
- `resend` - Resend SDK for email delivery
- `react` - React framework
- `zod` - Schema validation

## API Reference

### Email Service Functions

```typescript
import { 
  sendWelcomeEmail, 
  sendOrderConfirmationEmail, 
  sendOrderShippedEmail, 
  sendContactEmail, 
  sendTestEmail, 
  getEmailServiceStatus 
} from '@repo/email';

// Send welcome email to new users
const result = await sendWelcomeEmail('user@example.com', {
  firstName: 'Alex',
  dashboardUrl: 'https://app.threadly.com',
  browseUrl: 'https://threadly.com'
});

// Send order confirmation
const orderResult = await sendOrderConfirmationEmail('buyer@example.com', {
  firstName: 'Alex',
  orderId: 'order_123',
  productTitle: 'Vintage Denim Jacket',
  productImage: 'https://images.threadly.com/jacket.jpg',
  price: 89.99,
  sellerName: 'Sarah Johnson',
  orderUrl: 'https://app.threadly.com/orders/order_123'
});

// Send shipping notification
const shippingResult = await sendOrderShippedEmail('buyer@example.com', {
  firstName: 'Alex',
  orderId: 'order_123',
  productTitle: 'Vintage Denim Jacket',
  sellerName: 'Sarah Johnson',
  trackingNumber: 'TRK123456789',
  trackingUrl: 'https://track.carrier.com/TRK123456789',
  estimatedDelivery: 'March 15, 2024'
});

// Send contact form submission
const contactResult = await sendContactEmail({
  name: 'John Doe',
  email: 'john@example.com',
  message: 'I need help with my order.'
});

// Test email service
const testResult = await sendTestEmail('test@example.com');

// Check service status
const status = getEmailServiceStatus();
console.log(status); // { configured: true, from: 'noreply@threadly.com', provider: 'Resend' }
```

### Email Templates

```typescript
import { 
  WelcomeTemplate, 
  OrderConfirmationTemplate, 
  OrderShippedTemplate, 
  ContactTemplate 
} from '@repo/email';

// Use templates directly with Resend or other providers
const welcomeHtml = WelcomeTemplate({
  firstName: 'Alex',
  dashboardUrl: 'https://app.threadly.com',
  browseUrl: 'https://threadly.com'
});
```

## Usage Examples

### Welcome Email Flow

```typescript
// app/api/auth/callback/route.ts
import { sendWelcomeEmail } from '@repo/email';
import { auth } from '@repo/auth/server';

export async function POST(request: Request) {
  const { userId } = auth();
  const user = await database.user.findUnique({
    where: { clerkId: userId }
  });

  if (user && user.email) {
    // Send welcome email to new user
    await sendWelcomeEmail(user.email, {
      firstName: user.firstName || 'there',
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      browseUrl: process.env.NEXT_PUBLIC_WEB_URL || 'https://threadly.com'
    });
  }

  return Response.json({ success: true });
}
```

### Order Confirmation Email

```typescript
// app/api/orders/route.ts
import { sendOrderConfirmationEmail } from '@repo/email';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export async function POST(request: Request) {
  const { userId } = auth();
  const orderData = await request.json();

  // Create order in database
  const order = await database.order.create({
    data: {
      ...orderData,
      buyerId: userId
    },
    include: {
      buyer: true,
      product: {
        include: {
          seller: true,
          images: true
        }
      }
    }
  });

  // Send confirmation email
  if (order.buyer.email) {
    await sendOrderConfirmationEmail(order.buyer.email, {
      firstName: order.buyer.firstName || 'Customer',
      orderId: order.id,
      productTitle: order.product.title,
      productImage: order.product.images[0]?.imageUrl,
      price: order.total / 100, // Convert cents to dollars
      sellerName: `${order.product.seller.firstName} ${order.product.seller.lastName}`.trim(),
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`
    });
  }

  return Response.json({ success: true, order });
}
```

### Shipping Notification

```typescript
// app/api/orders/[id]/ship/route.ts
import { sendOrderShippedEmail } from '@repo/email';
import { database } from '@repo/database';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { trackingNumber, carrier, estimatedDelivery } = await request.json();

  const order = await database.order.update({
    where: { id: params.id },
    data: {
      status: 'SHIPPED',
      trackingNumber,
      shippedAt: new Date()
    },
    include: {
      buyer: true,
      product: {
        include: {
          seller: true,
          images: true
        }
      }
    }
  });

  // Send shipping notification
  if (order.buyer.email) {
    const trackingUrl = getTrackingUrl(carrier, trackingNumber);
    
    await sendOrderShippedEmail(order.buyer.email, {
      firstName: order.buyer.firstName || 'Customer',
      orderId: order.id,
      productTitle: order.product.title,
      productImage: order.product.images[0]?.imageUrl,
      sellerName: `${order.product.seller.firstName} ${order.product.seller.lastName}`.trim(),
      trackingNumber,
      trackingUrl,
      orderUrl: `${process.env.NEXT_PUBLIC_APP_URL}/orders/${order.id}`,
      estimatedDelivery
    });
  }

  return Response.json({ success: true });
}

function getTrackingUrl(carrier: string, trackingNumber: string): string {
  const trackingUrls: Record<string, string> = {
    'ups': `https://www.ups.com/track?tracknum=${trackingNumber}`,
    'fedex': `https://www.fedex.com/apps/fedextrack/?tracknumber=${trackingNumber}`,
    'usps': `https://tools.usps.com/go/TrackConfirmAction?tLabels=${trackingNumber}`,
    'dhl': `https://www.dhl.com/en/express/tracking.html?AWB=${trackingNumber}`
  };
  
  return trackingUrls[carrier.toLowerCase()] || `https://track.carrier.com/${trackingNumber}`;
}
```

### Contact Form Handler

```typescript
// app/api/contact/route.ts
import { sendContactEmail } from '@repo/email';
import { contactFormSchema } from '@repo/validation/schemas';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = contactFormSchema.parse(body);

    // Send contact email to support
    const result = await sendContactEmail({
      name: data.name,
      email: data.email,
      message: data.message
    });

    if (!result.success) {
      throw new Error('Failed to send email');
    }

    // Optionally store in database for tracking
    await database.contactSubmission.create({
      data: {
        name: data.name,
        email: data.email,
        message: data.message,
        emailId: result.id
      }
    });

    return Response.json({ 
      success: true, 
      message: 'Thank you for your message. We\'ll get back to you soon!' 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return Response.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
```

### Email Testing & Development

```typescript
// app/api/email/test/route.ts
import { sendTestEmail, getEmailServiceStatus } from '@repo/email';
import { auth } from '@repo/auth/server';

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const status = getEmailServiceStatus();
  
  return Response.json({
    emailService: status,
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { email } = await request.json();
  
  const result = await sendTestEmail(email);
  
  return Response.json({
    success: result.success,
    emailId: result.id,
    error: result.error
  });
}
```

### Custom Email Templates

```typescript
// Create custom template using React Email components
import {
  Body,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
  Button,
  Tailwind
} from '@react-email/components';

type PasswordResetTemplateProps = {
  firstName: string;
  resetUrl: string;
  expiresAt: string;
};

export const PasswordResetTemplate = ({
  firstName,
  resetUrl,
  expiresAt
}: PasswordResetTemplateProps) => (
  <Tailwind>
    <Html>
      <Head />
      <Preview>Reset your Threadly password</Preview>
      <Body className="bg-gray-50 font-sans">
        <Container className="mx-auto py-12 px-4">
          <Section className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <Text className="text-xl font-semibold text-gray-900 mb-4">
              Hi {firstName},
            </Text>
            
            <Text className="text-gray-700 mb-6 leading-relaxed">
              We received a request to reset your password for your Threadly account. 
              Click the button below to create a new password.
            </Text>

            <Section className="text-center my-8">
              <Button
                href={resetUrl}
                className="bg-black text-white px-6 py-3 rounded-lg font-medium"
              >
                Reset Password
              </Button>
            </Section>

            <Text className="text-gray-600 text-sm">
              This link will expire on {expiresAt}. If you didn't request this reset, 
              please ignore this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  </Tailwind>
);

// Send custom template
export async function sendPasswordResetEmail(
  to: string,
  data: PasswordResetTemplateProps
) {
  try {
    const result = await resend.emails.send({
      from: 'noreply@threadly.com',
      to,
      subject: 'Reset your Threadly password',
      react: PasswordResetTemplate(data),
    });

    return { success: true, id: result.data?.id };
  } catch (error) {
    return { success: false, error };
  }
}
```

## Available Email Templates

### 1. Welcome Email
- **Purpose**: Onboard new users
- **Trigger**: User registration
- **Data**: First name, dashboard URL, browse URL
- **Features**: Feature overview, quick tips, CTA buttons

### 2. Order Confirmation
- **Purpose**: Confirm purchase to buyer
- **Trigger**: Order creation
- **Data**: Order details, product info, seller info
- **Features**: Order summary, seller contact, order tracking

### 3. Order Shipped
- **Purpose**: Notify buyer of shipment
- **Trigger**: Order marked as shipped
- **Data**: Tracking info, delivery estimate
- **Features**: Tracking link, delivery details, order status

### 4. Contact Form
- **Purpose**: Forward contact inquiries to support
- **Trigger**: Contact form submission
- **Data**: Sender info, message content
- **Features**: Formatted message, reply-to sender

## Email Template Development

### Preview Templates

```bash
# Start email development server
npx react-email dev

# Preview templates at http://localhost:3000
```

### Template Best Practices

1. **Mobile-First**: All templates are responsive
2. **Accessibility**: Proper contrast and alt text
3. **Loading Speed**: Optimized images and minimal CSS
4. **Deliverability**: Tested across email clients
5. **Brand Consistency**: Follows Threadly design system

## Configuration

### Custom From Address

```typescript
// Use custom domain for better deliverability
const customConfig = {
  from: 'hello@yourdomain.com',
  replyTo: 'support@yourdomain.com',
  headers: {
    'X-Brand': 'Threadly',
    'X-Priority': '1'
  }
};
```

### Email Tracking

```typescript
// Add tracking parameters to links
const trackingParams = {
  utm_source: 'email',
  utm_medium: 'transactional',
  utm_campaign: 'order_confirmation'
};

const trackedUrl = `${baseUrl}?${new URLSearchParams(trackingParams)}`;
```

## Error Handling

```typescript
import { sendWelcomeEmail } from '@repo/email';

async function handleUserSignup(user: any) {
  try {
    const result = await sendWelcomeEmail(user.email, {
      firstName: user.firstName
    });

    if (!result.success) {
      // Log error but don't block user flow
      console.error('Welcome email failed:', result.error);
      
      // Optionally queue for retry
      await queueEmailForRetry('welcome', user.email, data);
    }

    return { success: true, emailSent: result.success };
  } catch (error) {
    console.error('Signup email error:', error);
    return { success: true, emailSent: false };
  }
}
```

## Testing

### Test Email Service

```typescript
// Test service configuration
import { getEmailServiceStatus, sendTestEmail } from '@repo/email';

const status = getEmailServiceStatus();
if (status.configured) {
  await sendTestEmail('test@example.com');
}
```

### Email Preview Tests

```bash
# Run email template tests
pnpm test packages/email

# Generate template screenshots
pnpm email:screenshots
```

## Performance & Deliverability

### Best Practices

1. **Domain Authentication**: Configure SPF, DKIM, DMARC
2. **List Hygiene**: Remove bounced/invalid emails
3. **Send Reputation**: Monitor sending metrics
4. **Content Quality**: Avoid spam triggers
5. **Segmentation**: Send relevant content

### Monitoring

```typescript
// Track email metrics
const emailMetrics = {
  sent: result.success ? 1 : 0,
  delivered: 0, // Updated via webhooks
  opened: 0,    // Updated via webhooks
  clicked: 0,   // Updated via webhooks
  bounced: 0,   // Updated via webhooks
};
```

## Integration Notes

This package integrates with:
- Resend for email delivery
- Authentication system for user data
- Order management for transactional emails
- Analytics for email tracking

## Security Considerations

- **Environment Variables**: All keys are properly secured
- **Input Validation**: All email data is validated
- **Rate Limiting**: Prevent email abuse
- **Unsubscribe**: Include unsubscribe links where required
- **Privacy**: Respect user email preferences

## Version History

- `0.0.0` - Initial release with Resend integration
- Core transactional email templates
- React Email component system
- TypeScript support with error handling
- Template preview and testing capabilities