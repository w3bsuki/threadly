import { auth } from '@clerk/nextjs/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../app/api/notifications/route';

// Mock dependencies
vi.mock('@clerk/nextjs/server');

describe('GET /api/notifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValueOnce({ userId: null } as any);

      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should allow authenticated users', async () => {
      vi.mocked(auth).mockReturnValueOnce({ userId: 'user_123' } as any);

      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Query Parameters', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should use default pagination values', async () => {
      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
    });

    it('should accept custom page parameter', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=3');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(3);
    });

    it('should accept custom limit parameter', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.limit).toBe(20);
    });

    it('should accept both page and limit parameters', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=2&limit=25');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(2);
      expect(data.meta.limit).toBe(25);
    });

    it('should validate page parameter as positive integer', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=0');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should validate limit parameter as positive integer', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=-5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should enforce maximum limit of 100', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=150');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should handle invalid page parameter gracefully', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=abc');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });

    it('should handle invalid limit parameter gracefully', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=xyz');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ error: 'Invalid query parameters' });
    });
  });

  describe('Response Format', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should return correct response structure', async () => {
      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('data');
      expect(data).toHaveProperty('meta');
      expect(Array.isArray(data.data)).toBe(true);
    });

    it('should include all meta fields', async () => {
      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(data.meta).toHaveProperty('page');
      expect(data.meta).toHaveProperty('limit');
      expect(data.meta).toHaveProperty('total');
      expect(data.meta).toHaveProperty('unreadCount');
    });

    it('should return empty array when no notifications exist', async () => {
      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(data.data).toEqual([]);
      expect(data.meta.total).toBe(0);
      expect(data.meta.unreadCount).toBe(0);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should handle unexpected errors gracefully', async () => {
      // Mock auth to throw an error
      vi.mocked(auth).mockImplementationOnce(() => {
        throw new Error('Unexpected error');
      });

      const request = new Request('http://localhost:3000/api/notifications');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch notifications' });
    });

    it('should handle malformed URLs', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=1&limit=50&extra=param');
      const response = await GET(request);
      const data = await response.json();

      // Should ignore extra parameters and still work
      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should handle empty query string', async () => {
      const request = new Request('http://localhost:3000/api/notifications?');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
    });

    it('should handle whitespace in query parameters', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=%20%20&limit=%20%20');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1);
      expect(data.meta.limit).toBe(50);
    });

    it('should handle decimal page numbers by coercing to integer', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=2.5');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(2);
    });

    it('should handle decimal limit numbers by coercing to integer', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=25.7');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.limit).toBe(25);
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should handle high page numbers', async () => {
      const request = new Request('http://localhost:3000/api/notifications?page=1000000');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.page).toBe(1000000);
      expect(data.data).toEqual([]); // No data at such high page
    });

    it('should limit results per page', async () => {
      const request = new Request('http://localhost:3000/api/notifications?limit=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.meta.limit).toBe(100);
    });
  });
});