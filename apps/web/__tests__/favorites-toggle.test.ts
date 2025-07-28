import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { POST } from '../app/api/favorites/toggle/route';

// Mock dependencies
vi.mock('@clerk/nextjs/server');
vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
    },
    favorite: {
      findFirst: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('POST /api/favorites/toggle', () => {
  const mockUser = {
    id: 'db_user_123',
    clerkId: 'clerk_user_123',
    email: 'test@example.com',
  };

  const mockFavorite = {
    id: 'fav_123',
    userId: 'db_user_123',
    productId: 'prod_123',
    createdAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: null } as any);

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Authentication required' });
    });

    it('should return 404 if database user not found', async () => {
      vi.mocked(auth).mockResolvedValueOnce({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValueOnce(null);

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'User not found' });
    });
  });

  describe('Request Validation', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should validate productId is required', async () => {
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
      expect(data.details).toBeDefined();
    });

    it('should validate productId is not empty', async () => {
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: '' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid request data');
    });

    it('should handle invalid JSON', async () => {
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: 'invalid json',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should accept valid productId', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Toggle Functionality', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
    });

    describe('Adding to Favorites', () => {
      beforeEach(() => {
        vi.mocked(database.favorite.findFirst).mockResolvedValue(null);
      });

      it('should add product to favorites if not already favorited', async () => {
        vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

        const request = new Request('http://localhost:3000/api/favorites/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod_123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          favorited: true,
          message: 'Added to favorites',
        });
      });

      it('should create favorite with correct data', async () => {
        vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

        const request = new Request('http://localhost:3000/api/favorites/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod_123' }),
        });

        await POST(request);

        expect(database.favorite.create).toHaveBeenCalledWith({
          data: {
            userId: 'db_user_123',
            productId: 'prod_123',
          },
        });
      });

      it('should check if favorite exists before creating', async () => {
        vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

        const request = new Request('http://localhost:3000/api/favorites/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod_123' }),
        });

        await POST(request);

        expect(database.favorite.findFirst).toHaveBeenCalledWith({
          where: {
            userId: 'db_user_123',
            productId: 'prod_123',
          },
        });
      });
    });

    describe('Removing from Favorites', () => {
      beforeEach(() => {
        vi.mocked(database.favorite.findFirst).mockResolvedValue(mockFavorite as any);
      });

      it('should remove product from favorites if already favorited', async () => {
        vi.mocked(database.favorite.delete).mockResolvedValueOnce(mockFavorite as any);

        const request = new Request('http://localhost:3000/api/favorites/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod_123' }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data).toEqual({
          favorited: false,
          message: 'Removed from favorites',
        });
      });

      it('should delete favorite by id', async () => {
        vi.mocked(database.favorite.delete).mockResolvedValueOnce(mockFavorite as any);

        const request = new Request('http://localhost:3000/api/favorites/toggle', {
          method: 'POST',
          body: JSON.stringify({ productId: 'prod_123' }),
        });

        await POST(request);

        expect(database.favorite.delete).toHaveBeenCalledWith({
          where: { id: 'fav_123' },
        });
      });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should handle database errors when checking favorite', async () => {
      vi.mocked(database.favorite.findFirst).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle database errors when creating favorite', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockRejectedValueOnce(
        new Error('Create failed')
      );

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle database errors when deleting favorite', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(mockFavorite as any);
      vi.mocked(database.favorite.delete).mockRejectedValueOnce(
        new Error('Delete failed')
      );

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });

    it('should handle user lookup errors', async () => {
      vi.mocked(database.user.findUnique).mockRejectedValueOnce(
        new Error('User lookup failed')
      );

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should handle very long product IDs', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

      const longProductId = 'prod_' + 'x'.repeat(100);
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: longProductId }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(database.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'db_user_123',
          productId: longProductId,
        },
      });
    });

    it('should handle special characters in product ID', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

      const specialProductId = 'prod_!@#$%^&*()_+-=[]{}|;:,.<>?';
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: specialProductId }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(database.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'db_user_123',
          productId: specialProductId,
        },
      });
    });

    it('should handle unicode characters in product ID', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

      const unicodeProductId = 'prod_🎉🎊🎈';
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: unicodeProductId }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(database.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'db_user_123',
          productId: unicodeProductId,
        },
      });
    });

    it('should handle extra fields in request body', async () => {
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      vi.mocked(database.favorite.create).mockResolvedValueOnce(mockFavorite as any);

      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({
          productId: 'prod_123',
          extraField: 'should be ignored',
          anotherField: 123,
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(database.favorite.create).toHaveBeenCalledWith({
        data: {
          userId: 'db_user_123',
          productId: 'prod_123',
        },
      });
    });
  });

  describe('Concurrent Requests', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
    });

    it('should handle concurrent toggle requests gracefully', async () => {
      // First request finds no favorite
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      // Second request also finds no favorite (race condition)
      vi.mocked(database.favorite.findFirst).mockResolvedValueOnce(null);
      
      // Both try to create, but second one might fail with unique constraint
      vi.mocked(database.favorite.create)
        .mockResolvedValueOnce(mockFavorite as any)
        .mockRejectedValueOnce(new Error('Unique constraint violation'));

      const request1 = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const request2 = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const [response1, response2] = await Promise.all([
        POST(request1),
        POST(request2),
      ]);

      expect(response1.status).toBe(200);
      expect(response2.status).toBe(500);
    });
  });

  describe('Response Headers', () => {
    beforeEach(() => {
      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_123' } as any);
      vi.mocked(database.user.findUnique).mockResolvedValue(mockUser as any);
      vi.mocked(database.favorite.findFirst).mockResolvedValue(null);
      vi.mocked(database.favorite.create).mockResolvedValue(mockFavorite as any);
    });

    it('should return correct content type', async () => {
      const request = new Request('http://localhost:3000/api/favorites/toggle', {
        method: 'POST',
        body: JSON.stringify({ productId: 'prod_123' }),
      });

      const response = await POST(request);

      expect(response.headers.get('content-type')).toContain('application/json');
    });
  });
});