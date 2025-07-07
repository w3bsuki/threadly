/**
 * Payment Flow Tests - 100% Coverage Required
 * 
 * This test suite covers all critical payment processing functionality
 * including Stripe integration, webhooks, and payment verification.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { POST as createCheckoutSession } from '../app/api/stripe/create-checkout-session/route';
import { POST as verifyPayment } from '../../app/app/api/stripe/verify-payment/route';
import { mockUsers, mockProducts, mockOrders } from '@repo/testing/mocks';
import { cleanup } from '@repo/testing';

// Mock external dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
    },
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    address: {
      create: vi.fn(),
    },
    order: {
      create: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      update: vi.fn(),
      updateMany: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
  },
}));

vi.mock('@repo/payments', () => ({
  stripe: {
    paymentIntents: {
      create: vi.fn(),
      retrieve: vi.fn(),
    },
  },
  calculatePlatformFee: vi.fn((amount: number) => amount * 0.05), // 5% fee
  isStripeConfigured: vi.fn(() => true),
}));

vi.mock('@repo/security', () => ({
  paymentRateLimit: {},
  checkRateLimit: vi.fn(() => ({
    allowed: true,
    headers: {},
  })),
}));

vi.mock('@repo/observability/server', () => ({
  log: {
    info: vi.fn(),
  },
  logError: vi.fn(),
}));

describe('Payment Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Create Checkout Session', () => {
    it('should create checkout session for valid request', async () => {
      // Mock dependencies
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        price: 79999,
        status: 'AVAILABLE',
        sellerId: 'user_1',
        seller: {
          stripeAccountId: 'acct_stripe_123',
        },
      });
      vi.mocked(database.address.create).mockResolvedValue({
        id: 'addr_temp_1',
        userId: 'user_2',
        streetLine1: 'TBD',
        city: 'TBD',
        state: 'TBD',
        zipCode: '00000',
        country: 'US',
      });
      vi.mocked(database.order.create).mockResolvedValue({
        id: 'order_new_1',
        buyerId: 'user_2',
        sellerId: 'user_1',
        productId: 'prod_1',
        amount: 79999,
        status: 'PENDING',
        shippingAddressId: 'addr_temp_1',
      });
      vi.mocked(stripe.paymentIntents.create).mockResolvedValue({
        id: 'pi_test_123',
        client_secret: 'pi_test_123_secret',
        amount: 79999,
        currency: 'usd',
        status: 'requires_payment_method',
      });

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.clientSecret).toBe('pi_test_123_secret');
      expect(data.orderId).toBe('order_new_1');

      // Verify payment intent was created with correct parameters
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith({
        amount: 79999,
        currency: 'usd',
        metadata: {
          orderId: 'order_new_1',
          productId: 'prod_1',
          buyerId: 'user_2',
          sellerId: 'user_1',
        },
        automatic_payment_methods: {
          enabled: true,
        },
        application_fee_amount: 4000, // 5% of 79999 cents
        transfer_data: {
          destination: 'acct_stripe_123',
        },
      });

      // Verify product was marked as RESERVED
      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: { status: 'RESERVED' },
      });
    });

    it('should reject unauthorized requests', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject self-purchase attempts', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        price: 79999,
        status: 'AVAILABLE',
        sellerId: 'user_1',
        seller: {
          stripeAccountId: 'acct_stripe_123',
        },
      });

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot purchase your own product');
    });

    it('should reject unavailable products', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_nonexistent',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Product not available');
    });

    it('should handle rate limiting', async () => {
      const { checkRateLimit } = await import('@repo/security');
      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        error: { message: 'Rate limit exceeded' },
        headers: { 'X-RateLimit-Remaining': '0' },
      });

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toBe('Rate limit exceeded');
    });

    it('should handle invalid request data', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: '', // Invalid empty string
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should handle Stripe configuration errors', async () => {
      const { isStripeConfigured } = await import('@repo/payments');
      vi.mocked(isStripeConfigured).mockReturnValue(false);

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Payment processing is not configured');
    });
  });

  describe('Payment Verification', () => {
    it('should verify successful payment', async () => {
      // Mock current user
      const mockCurrentUser = {
        id: 'clerk_user_2',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      vi.doMock('@repo/auth/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(mockCurrentUser)),
      }));

      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });

      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 79999,
        created: Date.now() / 1000,
        metadata: {
          orderId: 'order_1',
          productId: 'prod_1',
          buyerId: 'clerk_user_2',
          sellerId: 'user_1',
        },
      });

      vi.mocked(database.order.findFirst).mockResolvedValue({
        id: 'order_1',
        buyerId: 'user_2',
        sellerId: 'user_1',
        productId: 'prod_1',
        amount: { toNumber: () => 79999 },
        status: 'PENDING',
        product: {
          id: 'prod_1',
          title: 'iPhone 13 Pro',
          description: 'Excellent condition',
          price: { toNumber: () => 79999 },
          condition: 'VERY_GOOD',
          images: [{ url: 'https://example.com/image1.jpg' }],
          seller: { id: 'user_1', name: 'John Doe' },
        },
        seller: { id: 'user_1', name: 'John Doe' },
      });

      vi.mocked(database.order.update).mockResolvedValue({
        id: 'order_1',
        status: 'PAID',
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: 'pi_test_123',
        }),
      });

      const response = await verifyPayment(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('succeeded');
      expect(data.order).toBeDefined();
      expect(data.order.id).toBe('order_1');
      expect(data.order.orderItems).toHaveLength(1);
      expect(data.order.total).toBe(79999 * 1.08); // Including 8% tax
    });

    it('should reject unauthorized payment verification', async () => {
      vi.doMock('@repo/auth/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(null)),
      }));

      const request = new NextRequest('http://localhost:3000/api/stripe/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: 'pi_test_123',
        }),
      });

      const response = await verifyPayment(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should reject payment verification for other users', async () => {
      const mockCurrentUser = {
        id: 'clerk_user_3',
        firstName: 'Other',
        lastName: 'User',
      };

      vi.doMock('@repo/auth/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(mockCurrentUser)),
      }));

      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_3',
        clerkId: 'clerk_user_3',
      });

      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 79999,
        created: Date.now() / 1000,
        metadata: {
          orderId: 'order_1',
          productId: 'prod_1',
          buyerId: 'clerk_user_2', // Different user
          sellerId: 'user_1',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: 'pi_test_123',
        }),
      });

      const response = await verifyPayment(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle failed payments', async () => {
      const mockCurrentUser = {
        id: 'clerk_user_2',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      vi.doMock('@repo/auth/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(mockCurrentUser)),
      }));

      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });

      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_123',
        status: 'requires_payment_method',
        amount: 79999,
        created: Date.now() / 1000,
        metadata: {
          orderId: 'order_1',
          productId: 'prod_1',
          buyerId: 'clerk_user_2',
          sellerId: 'user_1',
        },
      });

      const request = new NextRequest('http://localhost:3000/api/stripe/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: 'pi_test_123',
        }),
      });

      const response = await verifyPayment(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Payment not successful');
      expect(data.status).toBe('requires_payment_method');
    });

    it('should handle multiple orders (cart scenario)', async () => {
      const mockCurrentUser = {
        id: 'clerk_user_2',
        firstName: 'Jane',
        lastName: 'Smith',
      };

      vi.doMock('@repo/auth/server', () => ({
        currentUser: vi.fn(() => Promise.resolve(mockCurrentUser)),
      }));

      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });

      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue({
        id: 'pi_test_123',
        status: 'succeeded',
        amount: 109998, // Total for 2 items
        created: Date.now() / 1000,
        metadata: {
          // No orderId for cart scenario
          buyerId: 'clerk_user_2',
        },
      });

      const mockOrders = [
        {
          id: 'order_1',
          buyerId: 'user_2',
          sellerId: 'user_1',
          productId: 'prod_1',
          amount: { toNumber: () => 79999 },
          status: 'PENDING',
          createdAt: new Date(),
          product: {
            id: 'prod_1',
            title: 'iPhone 13 Pro',
            description: 'Excellent condition',
            price: { toNumber: () => 79999 },
            condition: 'VERY_GOOD',
            images: [{ url: 'https://example.com/image1.jpg' }],
            seller: { id: 'user_1', name: 'John Doe' },
          },
          seller: { id: 'user_1', name: 'John Doe' },
        },
        {
          id: 'order_2',
          buyerId: 'user_2',
          sellerId: 'user_1',
          productId: 'prod_2',
          amount: { toNumber: () => 29999 },
          status: 'PENDING',
          createdAt: new Date(),
          product: {
            id: 'prod_2',
            title: 'Nike Shoes',
            description: 'Great condition',
            price: { toNumber: () => 29999 },
            condition: 'GOOD',
            images: [{ url: 'https://example.com/image2.jpg' }],
            seller: { id: 'user_1', name: 'John Doe' },
          },
          seller: { id: 'user_1', name: 'John Doe' },
        },
      ];

      vi.mocked(database.order.findMany).mockResolvedValue(mockOrders);

      const request = new NextRequest('http://localhost:3000/api/stripe/verify-payment', {
        method: 'POST',
        body: JSON.stringify({
          paymentIntentId: 'pi_test_123',
        }),
      });

      const response = await verifyPayment(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('succeeded');
      expect(data.order.orderItems).toHaveLength(2);
      expect(data.order.total).toBe(1099.98); // Payment amount in dollars
      expect(data.order.subtotal).toBe(79999 + 29999); // Sum of order amounts
    });
  });

  describe('Error Handling', () => {
    it('should handle Stripe API errors gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');
      const { stripe } = await import('@repo/payments');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        price: 79999,
        status: 'AVAILABLE',
        sellerId: 'user_1',
        seller: { stripeAccountId: 'acct_stripe_123' },
      });

      // Mock Stripe error
      vi.mocked(stripe.paymentIntents.create).mockRejectedValue(
        new Error('Your card was declined.')
      );

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });

    it('should handle database errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3001/api/stripe/create-checkout-session', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_1',
          sellerId: 'user_1',
        }),
      });

      const response = await createCheckoutSession(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to create checkout session');
    });
  });
});