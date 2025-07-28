import { auth } from '@clerk/nextjs/server';
import { database } from '@repo/database';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GET } from '../app/api/search/suggestions/route';

// Mock dependencies
vi.mock('@clerk/nextjs/server');
vi.mock('@repo/database', () => ({
  database: {
    product: {
      findMany: vi.fn(),
      groupBy: vi.fn(),
    },
    category: {
      findMany: vi.fn(),
    },
  },
}));
vi.mock('@repo/observability/server', () => ({
  logError: vi.fn(),
}));

describe('GET /api/search/suggestions', () => {
  const mockProducts = [
    {
      id: 'prod_1',
      title: 'iPhone 13 Pro',
      brand: 'Apple',
      category: { name: 'Electronics' },
      views: 100,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'prod_2',
      title: 'iPhone 14 Pro',
      brand: 'Apple',
      category: { name: 'Electronics' },
      views: 200,
      createdAt: new Date('2024-01-02'),
    },
    {
      id: 'prod_3',
      title: 'Samsung Galaxy S23',
      brand: 'Samsung',
      category: { name: 'Electronics' },
      views: 150,
      createdAt: new Date('2024-01-03'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication', () => {
    it('should return 401 if user is not authenticated', async () => {
      vi.mocked(auth).mockReturnValueOnce({ userId: null } as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should allow authenticated users', async () => {
      vi.mocked(auth).mockReturnValueOnce({ userId: 'user_123' } as any);
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);

      expect(response.status).toBe(200);
    });
  });

  describe('Query Validation', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should return empty array if query is missing', async () => {
      const request = new Request('http://localhost:3000/api/search/suggestions');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return empty array if query is too short', async () => {
      const request = new Request('http://localhost:3000/api/search/suggestions?q=a');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return empty array if query is too long', async () => {
      const longQuery = 'a'.repeat(101);
      const request = new Request(`http://localhost:3000/api/search/suggestions?q=${longQuery}`);
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should reject queries with HTML tags', async () => {
      const request = new Request('http://localhost:3000/api/search/suggestions?q=<script>alert("xss")</script>');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should trim whitespace from query', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=  test  ');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'AVAILABLE',
            title: {
              contains: 'test',
            },
          },
        })
      );
    });
  });

  describe('Product Suggestions', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
      vi.mocked(database.product.groupBy).mockResolvedValue([]);
      vi.mocked(database.category.findMany).mockResolvedValue([]);
    });

    it('should return product suggestions matching query', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce(mockProducts);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=iphone');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0]).toEqual({
        id: 'prod_2',
        title: 'iPhone 14 Pro',
        type: 'product',
        brand: 'Apple',
        category: 'Electronics',
      });
      expect(data[1]).toEqual({
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        type: 'product',
        brand: 'Apple',
        category: 'Electronics',
      });
    });

    it('should filter by available status', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'AVAILABLE',
            title: {
              contains: 'test',
            },
          },
        })
      );
    });

    it('should order products by views and creation date', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should limit product suggestions to 3', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 3,
        })
      );
    });

    it('should include category information', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            category: {
              select: {
                name: true,
              },
            },
          },
        })
      );
    });
  });

  describe('Brand Suggestions', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.category.findMany).mockResolvedValue([]);
    });

    it('should return brand suggestions matching query', async () => {
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: 'Applied Materials', _count: { brand: 5 } },
      ] as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=app');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toContainEqual({
        id: 'brand-0',
        title: 'Apple',
        type: 'brand',
      });
      expect(data).toContainEqual({
        id: 'brand-1',
        title: 'Applied Materials',
        type: 'brand',
      });
    });

    it('should filter brands by available products', async () => {
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'AVAILABLE',
            brand: {
              not: null,
              contains: 'test',
            },
          },
        })
      );
    });

    it('should order brands by product count', async () => {
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            _count: {
              brand: 'desc',
            },
          },
        })
      );
    });

    it('should limit brand suggestions to 2', async () => {
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.product.groupBy).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
        })
      );
    });

    it('should skip null brands', async () => {
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: null, _count: { brand: 5 } },
      ] as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      const brandSuggestions = data.filter((s: any) => s.type === 'brand');
      expect(brandSuggestions).toHaveLength(1);
      expect(brandSuggestions[0].title).toBe('Apple');
    });
  });

  describe('Category Suggestions', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.product.groupBy).mockResolvedValue([]);
    });

    it('should return category suggestions matching query', async () => {
      vi.mocked(database.category.findMany).mockResolvedValueOnce([
        {
          id: 'cat_1',
          name: 'Electronics',
          _count: { Product: 50 },
        },
        {
          id: 'cat_2',
          name: 'Electric Appliances',
          _count: { Product: 30 },
        },
      ] as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=elec');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toContainEqual({
        id: 'cat_2',
        title: 'Electric Appliances',
        type: 'category',
      });
      expect(data).toContainEqual({
        id: 'cat_1',
        title: 'Electronics',
        type: 'category',
      });
    });

    it('should filter categories by name', async () => {
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            name: {
              contains: 'test',
            },
          },
        })
      );
    });

    it('should include product count for categories', async () => {
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: {
            _count: {
              select: {
                Product: {
                  where: {
                    status: 'AVAILABLE',
                  },
                },
              },
            },
          },
        })
      );
    });

    it('should order categories by name', async () => {
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: {
            name: 'asc',
          },
        })
      );
    });

    it('should limit category suggestions to 2', async () => {
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);

      expect(database.category.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 2,
        })
      );
    });
  });

  describe('Combined Suggestions', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should combine all suggestion types', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([
        mockProducts[0],
        mockProducts[1],
      ]);
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
      ] as any);
      vi.mocked(database.category.findMany).mockResolvedValueOnce([
        {
          id: 'cat_1',
          name: 'Electronics',
          _count: { Product: 50 },
        },
      ] as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(4);
      
      const types = data.map((s: any) => s.type);
      expect(types).toContain('product');
      expect(types).toContain('brand');
      expect(types).toContain('category');
    });

    it('should limit total suggestions to 7', async () => {
      // Mock more than 7 total suggestions
      vi.mocked(database.product.findMany).mockResolvedValueOnce([
        ...mockProducts,
        ...mockProducts,
      ]);
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: 'Samsung', _count: { brand: 8 } },
        { brand: 'Google', _count: { brand: 5 } },
      ] as any);
      vi.mocked(database.category.findMany).mockResolvedValueOnce([
        { id: 'cat_1', name: 'Electronics', _count: { Product: 50 } },
        { id: 'cat_2', name: 'Clothing', _count: { Product: 30 } },
        { id: 'cat_3', name: 'Books', _count: { Product: 20 } },
      ] as any);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(7);
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should return empty array on database error', async () => {
      vi.mocked(database.product.findMany).mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle partial failures gracefully', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([mockProducts[0]]);
      vi.mocked(database.product.groupBy).mockRejectedValueOnce(new Error('GroupBy failed'));
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
    });

    it('should handle invalid search term gracefully', async () => {
      const request = new Request('http://localhost:3000/api/search/suggestions?q=%F0%9F%98%80');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Case Sensitivity', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should perform case-insensitive search', async () => {
      vi.mocked(database.product.findMany).mockResolvedValueOnce([]);
      vi.mocked(database.product.groupBy).mockResolvedValueOnce([]);
      vi.mocked(database.category.findMany).mockResolvedValueOnce([]);

      const request = new Request('http://localhost:3000/api/search/suggestions?q=TEST');
      await GET(request);

      expect(database.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: 'AVAILABLE',
            title: {
              contains: 'test',
            },
          },
        })
      );
    });
  });

  describe('Performance', () => {
    beforeEach(() => {
      vi.mocked(auth).mockReturnValue({ userId: 'user_123' } as any);
    });

    it('should execute all queries in parallel', async () => {
      const productPromise = new Promise((resolve) => 
        setTimeout(() => resolve([]), 100)
      );
      const brandPromise = new Promise((resolve) => 
        setTimeout(() => resolve([]), 100)
      );
      const categoryPromise = new Promise((resolve) => 
        setTimeout(() => resolve([]), 100)
      );

      vi.mocked(database.product.findMany).mockReturnValueOnce(productPromise as any);
      vi.mocked(database.product.groupBy).mockReturnValueOnce(brandPromise as any);
      vi.mocked(database.category.findMany).mockReturnValueOnce(categoryPromise as any);

      const startTime = Date.now();
      const request = new Request('http://localhost:3000/api/search/suggestions?q=test');
      await GET(request);
      const endTime = Date.now();

      // All queries should run in parallel, so total time should be ~100ms, not 300ms
      expect(endTime - startTime).toBeLessThan(200);
    });
  });
});