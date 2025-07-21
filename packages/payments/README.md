# @repo/payments

Stripe-powered payment processing for Threadly's C2C fashion marketplace. This package provides secure payment processing, marketplace payments with seller payouts, and AI-powered payment management tools.

## Overview

The payments package handles all payment-related functionality for Threadly:

- **Stripe Integration**: Complete Stripe payment processing with latest API
- **Marketplace Payments**: Support for seller payouts and platform fees
- **AI-Powered Tools**: Stripe Agent Toolkit for intelligent payment management
- **Currency Utilities**: Formatting, conversion, and calculation helpers
- **Security**: Server-only payment processing with proper key management
- **Type Safety**: Full TypeScript support with Stripe types
- **Webhook Support**: Secure webhook handling for payment events

## Installation

```bash
pnpm add @repo/payments
```

## Setup & Configuration

### Environment Variables

Add these to your `.env.local` file:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# For production
STRIPE_SECRET_KEY=sk_live_your_live_secret_key
```

### Stripe Configuration

The package automatically validates your Stripe keys and provides a configured Stripe instance:

```typescript
import { stripe, isStripeConfigured } from '@repo/payments';

// Check if Stripe is properly configured
if (isStripeConfigured()) {
  // Safe to use Stripe
}
```

## Dependencies

This package depends on:
- `@stripe/agent-toolkit` - AI-powered Stripe management tools
- `@t3-oss/env-nextjs` - Environment variable validation
- `server-only` - Server-side only code protection
- `stripe` - Official Stripe Node.js SDK
- `zod` - Schema validation

## API Reference

### Server-Side Usage

```typescript
import { 
  stripe, 
  formatCurrency, 
  calculatePlatformFee, 
  calculateSellerPayout 
} from '@repo/payments';

// Create a payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: 2000, // $20.00 in cents
  currency: 'usd',
  metadata: {
    orderId: 'order_123',
    sellerId: 'seller_456'
  }
});

// Calculate fees
const orderAmount = 10000; // $100.00 in cents
const platformFee = calculatePlatformFee(orderAmount); // $5.00 in cents
const sellerPayout = calculateSellerPayout(orderAmount); // $95.00 in cents

// Format currency for display
const formattedAmount = formatCurrency(orderAmount / 100); // "$100.00"
```

### Client-Side Usage

```typescript
import { 
  formatCurrency, 
  calculatePlatformFee, 
  calculateSellerPayout,
  centsToDollars,
  dollarsToCents 
} from '@repo/payments/client';

// Safe client-side utilities (no Stripe secrets)
const price = 89.99;
const priceInCents = dollarsToCents(price); // 8999
const priceInDollars = centsToDollars(priceInCents); // 89.99

const platformFee = calculatePlatformFee(priceInCents); // 450 cents ($4.50)
const sellerEarnings = calculateSellerPayout(priceInCents); // 8549 cents ($85.49)

const formattedPrice = formatCurrency(price); // "$89.99"
```

### AI-Powered Payment Tools

```typescript
import { paymentsAgentToolkit } from '@repo/payments/ai';

// Use with AI SDK for intelligent payment management
const tools = paymentsAgentToolkit.getTools();

// Example: AI can create payment links, products, and prices
// This is useful for AI assistants that help sellers manage their products
```

## Usage Examples

### Complete Payment Flow

```typescript
// app/api/payments/create-intent/route.ts
import { stripe, calculatePlatformFee } from '@repo/payments';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { productId, quantity = 1 } = await request.json();

    // Get product details
    const product = await database.product.findUnique({
      where: { id: productId },
      include: { seller: true }
    });

    if (!product) {
      return Response.json({ error: 'Product not found' }, { status: 404 });
    }

    const totalAmount = product.price * quantity; // In cents
    const platformFee = calculatePlatformFee(totalAmount);

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmount,
      currency: 'usd',
      metadata: {
        productId: product.id,
        sellerId: product.sellerId,
        buyerId: userId,
        quantity: quantity.toString(),
        platformFee: platformFee.toString()
      },
      // For marketplace payments, you might want to use transfers
      transfer_data: {
        destination: product.seller.stripeAccountId, // Seller's connected account
        amount: totalAmount - platformFee,
      },
    });

    return Response.json({
      clientSecret: paymentIntent.client_secret,
      amount: totalAmount,
      platformFee,
      sellerPayout: totalAmount - platformFee
    });

  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return Response.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
```

### Marketplace Seller Onboarding

```typescript
// app/api/payments/connect/onboard/route.ts
import { stripe } from '@repo/payments';
import { auth } from '@repo/auth/server';
import { database } from '@repo/database';

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Create Stripe Connect account for seller
    const account = await stripe.accounts.create({
      type: 'express',
      country: 'US', // Should be dynamic based on seller location
      email: user.email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });

    // Save account ID to database
    await database.user.update({
      where: { clerkId: userId },
      data: { stripeAccountId: account.id }
    });

    // Create onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/onboarding/refresh`,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/seller/dashboard`,
      type: 'account_onboarding',
    });

    return Response.json({ url: accountLink.url });

  } catch (error) {
    console.error('Stripe onboarding failed:', error);
    return Response.json(
      { error: 'Failed to create onboarding link' },
      { status: 500 }
    );
  }
}
```

### Webhook Handling

```typescript
// app/api/webhooks/stripe/route.ts
import { stripe } from '@repo/payments';
import { keys } from '@repo/payments/keys';
import { database } from '@repo/database';

const webhookSecret = keys().STRIPE_WEBHOOK_SECRET;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !webhookSecret) {
    return Response.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'account.updated':
        await handleAccountUpdated(event.data.object);
        break;
        
      case 'transfer.created':
        await handleTransferCreated(event.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return Response.json({ received: true });

  } catch (error) {
    console.error('Webhook handling failed:', error);
    return Response.json(
      { error: 'Webhook handling failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent: any) {
  const { productId, sellerId, buyerId, quantity } = paymentIntent.metadata;
  
  // Create order record
  const order = await database.order.create({
    data: {
      stripePaymentIntentId: paymentIntent.id,
      buyerId,
      sellerId,
      productId,
      quantity: parseInt(quantity),
      amount: paymentIntent.amount,
      status: 'COMPLETED',
      paymentStatus: 'PAID'
    }
  });

  // Update product availability
  await database.product.update({
    where: { id: productId },
    data: { status: 'SOLD' }
  });

  console.log('Order created:', order.id);
}

async function handlePaymentFailed(paymentIntent: any) {
  console.error('Payment failed:', paymentIntent.id);
  // Handle failed payment (send notification, update order status, etc.)
}
```

### Client-Side Payment Processing

```typescript
// components/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import { formatCurrency } from '@repo/payments/client';

interface CheckoutFormProps {
  productId: string;
  price: number;
  onSuccess: () => void;
}

export function CheckoutForm({ productId, price, onSuccess }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create payment intent
      const response = await fetch('/api/payments/create-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId })
      });

      const { clientSecret, amount, platformFee, sellerPayout } = await response.json();

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      // Here you would integrate with Stripe Elements
      // This is a simplified example
      console.log('Payment Intent created:', clientSecret);
      
      // Simulate successful payment for demo
      setTimeout(() => {
        onSuccess();
        setIsLoading(false);
      }, 2000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment failed');
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-form">
      <div className="payment-summary">
        <h3>Payment Summary</h3>
        <div className="flex justify-between">
          <span>Item Price:</span>
          <span>{formatCurrency(price / 100)}</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>Platform Fee (5%):</span>
          <span>{formatCurrency(calculatePlatformFee(price) / 100)}</span>
        </div>
        <div className="flex justify-between font-bold">
          <span>Total:</span>
          <span>{formatCurrency(price / 100)}</span>
        </div>
      </div>

      {error && (
        <div className="error-message text-red-600 mb-4">
          {error}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {isLoading ? 'Processing...' : `Pay ${formatCurrency(price / 100)}`}
      </button>
    </div>
  );
}
```

### Seller Dashboard Integration

```typescript
// components/SellerPayouts.tsx
'use client';

import { useEffect, useState } from 'react';
import { formatCurrency } from '@repo/payments/client';

interface PayoutData {
  totalEarnings: number;
  pendingPayouts: number;
  lastPayout: number;
  nextPayoutDate: string;
}

export function SellerPayouts() {
  const [payoutData, setPayoutData] = useState<PayoutData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayoutData();
  }, []);

  const fetchPayoutData = async () => {
    try {
      const response = await fetch('/api/seller/payouts');
      const data = await response.json();
      setPayoutData(data);
    } catch (error) {
      console.error('Failed to fetch payout data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading payout information...</div>;
  if (!payoutData) return <div>Unable to load payout data</div>;

  return (
    <div className="seller-payouts">
      <h2 className="text-2xl font-bold mb-6">Earnings & Payouts</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Total Earnings</h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(payoutData.totalEarnings / 100)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Pending Payouts</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {formatCurrency(payoutData.pendingPayouts / 100)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Last Payout</h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(payoutData.lastPayout / 100)}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-600">Next Payout</h3>
          <p className="text-sm font-medium">
            {payoutData.nextPayoutDate}
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Payout Information</h4>
        <p className="text-sm text-blue-700">
          Payouts are processed automatically every 2 business days. 
          Threadly takes a 5% platform fee from each sale.
        </p>
      </div>
    </div>
  );
}
```

## Utility Functions

### Currency Helpers

```typescript
import { 
  formatCurrency, 
  centsToDollars, 
  dollarsToCents,
  calculatePlatformFee,
  calculateSellerPayout 
} from '@repo/payments/client';

// Format currency for display
formatCurrency(99.99);           // "$99.99"
formatCurrency(99.99, 'eur');    // "€99.99"

// Convert between cents and dollars
dollarsToCents(99.99);           // 9999
centsToDollars(9999);            // 99.99

// Calculate marketplace fees (5% platform fee)
calculatePlatformFee(10000);     // 500 (5% of $100)
calculateSellerPayout(10000);    // 9500 (95% of $100)
```

## Configuration

### Platform Fee Settings

```typescript
// The platform fee is currently set to 5% and can be modified in the package
const PLATFORM_FEE_PERCENTAGE = 0.05; // 5%

// You can customize this for different seller tiers
const calculateDynamicPlatformFee = (amount: number, sellerTier: string) => {
  const feeRates = {
    'standard': 0.05,    // 5%
    'premium': 0.03,     // 3%
    'enterprise': 0.02   // 2%
  };
  
  const rate = feeRates[sellerTier] || 0.05;
  return Math.round(amount * rate);
};
```

### Stripe Configuration

```typescript
// The package uses Stripe API version 2024-12-18.acacia
// This ensures compatibility with the latest Stripe features

const stripeConfig = {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
  maxNetworkRetries: 3,
  timeout: 20000, // 20 seconds
};
```

## Security Considerations

- **Server-Only**: Stripe secret keys are only available server-side
- **Webhook Verification**: All webhooks are verified using Stripe signatures
- **Environment Validation**: Keys are validated at runtime with Zod schemas
- **HTTPS Required**: Production requires HTTPS for Stripe integration
- **PCI Compliance**: Follow Stripe's security guidelines

## Error Handling

```typescript
import { stripe, isStripeConfigured } from '@repo/payments';

export async function createPaymentIntent(amount: number) {
  if (!isStripeConfigured()) {
    throw new Error('Stripe is not configured');
  }

  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
    });
    
    return paymentIntent;
  } catch (error) {
    if (error instanceof Stripe.errors.StripeCardError) {
      // Card was declined
      throw new Error(`Payment failed: ${error.message}`);
    } else if (error instanceof Stripe.errors.StripeRateLimitError) {
      // Rate limit exceeded
      throw new Error('Too many requests, please try again later');
    } else if (error instanceof Stripe.errors.StripeInvalidRequestError) {
      // Invalid parameters
      throw new Error(`Invalid request: ${error.message}`);
    } else {
      // Generic error
      throw new Error('Payment processing failed');
    }
  }
}
```

## Testing

```bash
# Run payments package tests
pnpm test packages/payments

# Test with Stripe test keys
STRIPE_SECRET_KEY=sk_test_... pnpm test
```

## Integration Notes

This package integrates with:
- Stripe for payment processing and marketplace features
- Authentication system for user verification
- Database for order and transaction records
- AI tools for intelligent payment management

## Best Practices

1. **Always validate webhooks** with Stripe signatures
2. **Use idempotency keys** for critical operations
3. **Handle errors gracefully** with proper user feedback
4. **Test thoroughly** with Stripe's test cards
5. **Monitor transactions** and set up alerts
6. **Keep fees transparent** to users and sellers

## Version History

- `0.0.0` - Initial release with Stripe integration
- Core payment processing
- Marketplace seller payouts
- AI-powered payment tools
- TypeScript support with full Stripe types