import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testApiHandler, createMockRequest } from '../utils/test-api-handler';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

describe('GET /api/notifications - Integration Tests', () => {
  let mockAuth: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const authModule = await import('@clerk/nextjs/server');
    mockAuth = authModule.auth;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockReturnValueOnce({ userId: null });

      const { GET } = await import('../../app/api/notifications/route');

      const { status, data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should allow authenticated users', async () => {
      mockAuth.mockReturnValueOnce({ userId: 'user_123' });

      const { GET } = await import('../../app/api/notifications/route');

      const { status } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(status).toBe(200);
    });
  });

  describe('Query Parameter Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should use default pagination values', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const { status, data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(status).toBe(200);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
    });

    it('should accept custom page parameter', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { page: '3' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(3);
    });

    it('should accept custom limit parameter', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { limit: '20' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.limit).toBe(20);
    });

    it('should validate page parameter as positive integer', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { page: '0' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should validate limit parameter as positive integer', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { limit: '-5' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should enforce maximum limit of 100', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { limit: '150' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });
  });

  describe('Response Format Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should return correct response structure', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const { status, data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include all meta fields', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const { data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('limit');
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('unreadCount');
    });

    it('should return empty array when no notifications exist', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const { data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(data.data).toEqual([]);
      expect(data.meta.total).toBe(0);
      expect(data.meta.unreadCount).toBe(0);
    });
  });

  describe('Error Handling Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should handle unexpected errors gracefully', async () => {
      mockAuth.mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const { GET } = await import('../../app/api/notifications/route');

      const { status, data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/notifications',
      });

      expect(status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch notifications' });
    });
  });

  describe('Performance Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should handle high page numbers', async () => {
      const { GET } = await import('../../app/api/notifications/route');

      const request = createMockRequest('http://localhost:3000/api/notifications', {
        searchParams: { page: '1000000' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1000000);
      expect(data.data).toEqual([]); // No data at such high page
    });
  });
});