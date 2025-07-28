import { NextRequest } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// Mock dependencies
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

// Import mocked modules
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { stripe } from '@repo/payments';
import { POST } from '../app/api/checkout/finalize-order/route';

describe('POST /api/checkout/finalize-order', () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce(null);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 404 if database user not found', async () => {
      vi.mocked(currentUser).mockResolvedValueOnce(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValueOnce(null);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockDbUser as any);
    });

    it('should return 400 for invalid request body', async () => {
      const invalidBody = {
        paymentIntentId: 'pi_test_123',
        // Missing required fields
      };

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
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

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should validate contact info email format', async () => {
      const invalidBody = {
        ...validRequestBody,
        contactInfo: {
          ...validRequestBody.contactInfo,
          email: 'invalid-email',
        },
      };

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should validate shipping method enum', async () => {
      const invalidBody = {
        ...validRequestBody,
        shippingMethod: 'invalid' as any,
      };

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(invalidBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });
  });

  describe('Payment Intent Validation', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockDbUser as any);
    });

    it('should return 400 if payment intent not found', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce(null as any);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid payment intent' });
    });

    it('should return 400 if payment intent buyer does not match', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
        ...mockPaymentIntent,
        metadata: {
          ...mockPaymentIntent.metadata,
          buyerId: 'different_user',
        },
      } as any);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid payment intent' });
    });

    it('should return 400 if payment not succeeded', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
        ...mockPaymentIntent,
        status: 'processing',
      } as any);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Payment not completed' });
    });
  });

  describe('Order Creation', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockDbUser as any);
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(mockPaymentIntent as any);
      vi.mocked(database.product.findMany).mockResolvedValue(mockProducts as any);
    });

    it('should successfully create orders for all items', async () => {
      const mockOrders = [
        { id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 },
        { id: 'order_2', sellerId: 'seller_2', productId: 'prod_2', amount: 220 },
      ];

      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        // Mock transaction behavior
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
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.orders).toHaveLength(2);
      expect(data.orders[0]).toEqual({
        id: 'order_1',
        sellerId: 'seller_1',
        productId: 'prod_1',
        amount: 120,
      });
    });

    it('should update user contact information', async () => {
      const updateMock = vi.fn().mockResolvedValue({});
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: updateMock,
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 }),
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      await POST(request);

      expect(updateMock).toHaveBeenCalledWith({
        where: { id: 'db_user_123' },
        data: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
        },
      });
    });

    it('should create shipping addresses for each order', async () => {
      const createAddressMock = vi.fn().mockResolvedValue({ id: 'addr_1' });
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: createAddressMock,
          },
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 }),
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      await POST(request);

      expect(createAddressMock).toHaveBeenCalledWith({
        data: {
          userId: 'db_user_123',
          firstName: 'John',
          lastName: 'Doe',
          streetLine1: '123 Main St',
          city: 'Test City',
          state: 'TS',
          zipCode: '12345',
          country: 'US',
          type: 'SHIPPING',
        },
      });
    });

    it('should update product status to SOLD', async () => {
      const updateProductMock = vi.fn().mockResolvedValue({});
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 }),
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: updateProductMock,
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      await POST(request);

      expect(updateProductMock).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: { status: 'SOLD' },
      });
    });

    it('should create payment records for each order', async () => {
      const createPaymentMock = vi.fn().mockResolvedValue({});
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 }),
          },
          payment: {
            create: createPaymentMock,
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      await POST(request);

      expect(createPaymentMock).toHaveBeenCalledWith({
        data: {
          orderId: 'order_1',
          stripePaymentId: 'pi_test_123',
          amount: 120,
          status: 'succeeded',
        },
      });
    });

    it('should skip products that are not found', async () => {
      vi.mocked(database.product.findMany).mockResolvedValue([mockProducts[0]] as any);
      
      const createOrderMock = vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 });
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: createOrderMock,
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(1);
      expect(createOrderMock).toHaveBeenCalledTimes(1);
    });

    it('should calculate order amounts correctly', async () => {
      const createOrderMock = vi.fn()
        .mockResolvedValueOnce({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 })
        .mockResolvedValueOnce({ id: 'order_2', sellerId: 'seller_2', productId: 'prod_2', amount: 220 });
      
      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: createOrderMock,
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      await POST(request);

      // First order: item total (100) + shipping (5) + tax (15) = 120
      expect(createOrderMock).toHaveBeenNthCalledWith(1, {
        data: expect.objectContaining({
          amount: 120,
        }),
      });

      // Second order: item total (200) + shipping (5) + tax (15) = 220
      expect(createOrderMock).toHaveBeenNthCalledWith(2, {
        data: expect.objectContaining({
          amount: 220,
        }),
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockDbUser as any);
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(mockPaymentIntent as any);
      vi.mocked(database.product.findMany).mockResolvedValue(mockProducts as any);
    });

    it('should handle transaction failures', async () => {
      vi.mocked(database.$transaction).mockRejectedValueOnce(new Error('Transaction failed'));

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle Stripe API errors', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockRejectedValueOnce(new Error('Stripe error'));

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle database query errors', async () => {
      vi.mocked(database.product.findMany).mockRejectedValueOnce(new Error('Database error'));

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(currentUser).mockResolvedValue(mockUser as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockDbUser as any);
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValue(mockPaymentIntent as any);
      vi.mocked(database.product.findMany).mockResolvedValue(mockProducts as any);
    });

    it('should handle empty item list', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
        ...mockPaymentIntent,
        metadata: {
          ...mockPaymentIntent.metadata,
          items: JSON.stringify([]),
        },
      } as any);

      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn(),
          },
          payment: {
            create: vi.fn(),
          },
          product: {
            update: vi.fn(),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.orders).toHaveLength(0);
    });

    it('should handle malformed payment intent metadata', async () => {
      vi.mocked(stripe.paymentIntents.retrieve).mockResolvedValueOnce({
        ...mockPaymentIntent,
        metadata: {
          ...mockPaymentIntent.metadata,
          items: 'invalid json',
        },
      } as any);

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle optional billing address', async () => {
      const requestWithoutBilling = {
        ...validRequestBody,
        billingAddress: undefined,
      };

      vi.mocked(database.$transaction).mockImplementationOnce(async (callback) => {
        const tx = {
          user: {
            update: vi.fn().mockResolvedValue({}),
          },
          address: {
            create: vi.fn().mockResolvedValue({ id: 'addr_1' }),
          },
          order: {
            create: vi.fn().mockResolvedValue({ id: 'order_1', sellerId: 'seller_1', productId: 'prod_1', amount: 120 }),
          },
          payment: {
            create: vi.fn().mockResolvedValue({}),
          },
          product: {
            update: vi.fn().mockResolvedValue({}),
          },
        };
        return callback(tx as any);
      });

      const request = new Request('http://localhost:3000/api/checkout/finalize-order', {
        method: 'POST',
        body: JSON.stringify(requestWithoutBilling),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});