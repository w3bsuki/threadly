import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testApiHandler } from '../utils/test-api-handler';

// Mock all dependencies at the top level
vi.mock('@repo/auth/server', () => ({
  currentUser: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      update: vi.fn(),
    },
    order: {
      create: vi.fn(),
    },
    address: {
      create: vi.fn(),
    },
    payment: {
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

vi.mock('@repo/payments', () => ({
  stripe: {
    paymentIntents: {
      retrieve: vi.fn(),
    },
  },
}));

vi.mock('@repo/observability/server', () => ({
  log: {
    info: vi.fn(),
  },
  logError: vi.fn(),
}));

describe('POST /api/checkout/finalize-order - Integration Tests', () => {
  let mockCurrentUser: any;
  let mockDatabase: any;
  let mockStripe: any;

  const mockUser = {
    id: 'clerk_user_123',
    email: 'test@example.com',
  };

  const mockDbUser = {
    id: 'db_user_123',
    clerkId: 'clerk_user_123',
    email: 'test@example.com',
  };

  const mockPaymentIntent = {
    id: 'pi_test_123',
    status: 'succeeded',
    metadata: {
      buyerId: 'db_user_123',
      items: JSON.stringify([
        {
          productId: 'prod_1',
          price: 100,
          quantity: 1,
        },
        {
          productId: 'prod_2',
          price: 200,
          quantity: 1,
        },
      ]),
      costs: JSON.stringify({
        shipping: 10,
        tax: 30,
      }),
    },
  };

  const mockProducts = [
    {
      id: 'prod_1',
      sellerId: 'seller_1',
      title: 'Product 1',
      price: 100,
      status: 'AVAILABLE',
      seller: { id: 'seller_1', name: 'Seller 1' },
    },
    {
      id: 'prod_2',
      sellerId: 'seller_2',
      title: 'Product 2',
      price: 200,
      status: 'AVAILABLE',
      seller: { id: 'seller_2', name: 'Seller 2' },
    },
  ];

  const validRequestBody = {
    paymentIntentId: 'pi_test_123',
    shippingAddress: {
      street: '123 Main St',
      city: 'Test City',
      state: 'TS',
      postalCode: '12345',
      country: 'US',
    },
    billingAddress: {
      street: '456 Billing St',
      city: 'Bill City',
      state: 'BS',
      postalCode: '54321',
      country: 'US',
    },
    shippingMethod: 'standard' as const,
    contactInfo: {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      phone: '1234567890',
    },
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Get mocked modules
    const authModule = await import('@repo/auth/server');
    const dbModule = await import('@repo/database');
    const paymentsModule = await import('@repo/payments');
    
    mockCurrentUser = authModule.currentUser;
    mockDatabase = dbModule.database;
    mockStripe = paymentsModule.stripe;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockCurrentUser.mockResolvedValueOnce(null);

      // Import the route handler dynamically
      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 if database user not found', async () => {
      mockCurrentUser.mockResolvedValueOnce(mockUser);
      mockDatabase.user.findUnique.mockResolvedValueOnce(null);

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });
  });

  describe('Request Validation Tests', () => {
    beforeEach(() => {
      mockCurrentUser.mockResolvedValue(mockUser);
      mockDatabase.user.findUnique.mockResolvedValue(mockDbUser);
    });

    it('should return 400 for invalid request body', async () => {
      const invalidBody = {
        paymentIntentId: 'pi_test_123',
        // Missing required fields
      };

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: invalidBody,
      });

      expect(status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should validate shipping address fields', async () => {
      const invalidBody = {
        ...validRequestBody,
        shippingAddress: {
          street: '', // Empty street
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US',
        },
      };

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: invalidBody,
      });

      expect(status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('Payment Intent Validation Tests', () => {
    beforeEach(() => {
      mockCurrentUser.mockResolvedValue(mockUser);
      mockDatabase.user.findUnique.mockResolvedValue(mockDbUser);
    });

    it('should return 400 if payment intent not found', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce(null);

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(400);
      expect(data).toEqual({ error: 'Invalid payment intent' });
    });

    it('should return 400 if payment intent buyer does not match', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce({
        ...mockPaymentIntent,
        metadata: {
          ...mockPaymentIntent.metadata,
          buyerId: 'different_user',
        },
      });

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(400);
      expect(data).toEqual({ error: 'Invalid payment intent' });
    });

    it('should return 400 if payment not succeeded', async () => {
      mockStripe.paymentIntents.retrieve.mockResolvedValueOnce({
        ...mockPaymentIntent,
        status: 'processing',
      });

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(400);
      expect(data).toEqual({ error: 'Payment not completed' });
    });
  });

  describe('Order Creation Tests', () => {
    beforeEach(() => {
      mockCurrentUser.mockResolvedValue(mockUser);
      mockDatabase.user.findUnique.mockResolvedValue(mockDbUser);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
      mockDatabase.product.findMany.mockResolvedValue(mockProducts);
    });

    it('should successfully create orders for all items', async () => {
      const mockOrders = [
        { id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 },
        { id: 'order_2', sellerId: 'seller_2', productId: 'prod_2', amount: 220 },
      ];

      mockDatabase.$transaction.mockImplementationOnce(async (callback: any) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn()
              .mockResolvedValueOnce(mockOrders[0])
              .mockResolvedValueOnce(mockOrders[1]),
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders).toHaveLength(2);
      expect(data.orders[0]).toEqual({
        id: 'order_1',
        sellerId: 'seller_1',
        productId: 'prod_1',
        amount: 120,
      });
    });
  });

  describe('Error Handling Tests', () => {
    beforeEach(() => {
      mockCurrentUser.mockResolvedValue(mockUser);
      mockDatabase.user.findUnique.mockResolvedValue(mockDbUser);
      mockStripe.paymentIntents.retrieve.mockResolvedValue(mockPaymentIntent);
      mockDatabase.product.findMany.mockResolvedValue(mockProducts);
    });

    it('should handle transaction failures', async () => {
      mockDatabase.$transaction.mockRejectedValueOnce(new Error('Transaction failed'));

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle Stripe API errors', async () => {
      mockStripe.paymentIntents.retrieve.mockRejectedValueOnce(new Error('Stripe error'));

      const { POST } = await import('../../app/api/checkout/finalize-order/route');

      const { status, data } = await testApiHandler(POST, {
        method: 'POST',
        url: 'http://localhost:3000/api/checkout/finalize-order',
        body: validRequestBody,
      });

      expect(status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });
});