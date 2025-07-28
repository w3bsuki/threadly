import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { testApiHandler, createMockRequest } from '../utils/test-api-handler';

// Mock dependencies
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

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

describe('GET /api/search/suggestions - Integration Tests', () => {
  let mockAuth: any;
  let mockDatabase: any;

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
  ];

  beforeEach(async () => {
    vi.clearAllMocks();
    
    const authModule = await import('@clerk/nextjs/server');
    const dbModule = await import('@repo/database');
    
    mockAuth = authModule.auth;
    mockDatabase = dbModule.database;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication Tests', () => {
    it('should return 401 if user is not authenticated', async () => {
      mockAuth.mockReturnValueOnce({ userId: null });

      const { GET } = await import('../../app/api/search/suggestions/route');

      const { status, data } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/search/suggestions?q=test',
      });

      expect(status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should allow authenticated users', async () => {
      mockAuth.mockReturnValueOnce({ userId: 'user_123' });
      mockDatabase.product.findMany.mockResolvedValueOnce([]);
      mockDatabase.product.groupBy.mockResolvedValueOnce([]);
      mockDatabase.category.findMany.mockResolvedValueOnce([]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const { status } = await testApiHandler(GET, {
        method: 'GET',
        url: 'http://localhost:3000/api/search/suggestions?q=test',
      });

      expect(status).toBe(200);
    });
  });

  describe('Query Validation Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should return empty array if query is missing', async () => {
      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return empty array if query is too short', async () => {
      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'a' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should return empty array if query is too long', async () => {
      const { GET } = await import('../../app/api/search/suggestions/route');

      const longQuery = 'a'.repeat(101);
      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: longQuery },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should reject queries with HTML tags', async () => {
      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: '<script>alert("xss")</script>' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });
  });

  describe('Product Suggestions Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockDatabase.product.groupBy.mockResolvedValue([]);
      mockDatabase.category.findMany.mockResolvedValue([]);
    });

    it('should return product suggestions matching query', async () => {
      mockDatabase.product.findMany.mockResolvedValueOnce(mockProducts);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'iphone' },
      });

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
      mockDatabase.product.findMany.mockResolvedValueOnce([]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      await GET(request);

      expect(mockDatabase.product.findMany).toHaveBeenCalledWith(
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

  describe('Brand Suggestions Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockDatabase.product.findMany.mockResolvedValue([]);
      mockDatabase.category.findMany.mockResolvedValue([]);
    });

    it('should return brand suggestions matching query', async () => {
      mockDatabase.product.groupBy.mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: 'Applied Materials', _count: { brand: 5 } },
      ]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'app' },
      });

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

    it('should skip null brands', async () => {
      mockDatabase.product.groupBy.mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: null, _count: { brand: 5 } },
      ]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      const response = await GET(request);
      const data = await response.json();

      const brandSuggestions = data.filter((s: any) => s.type === 'brand');
      expect(brandSuggestions).toHaveLength(1);
      expect(brandSuggestions[0].title).toBe('Apple');
    });
  });

  describe('Category Suggestions Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
      mockDatabase.product.findMany.mockResolvedValue([]);
      mockDatabase.product.groupBy.mockResolvedValue([]);
    });

    it('should return category suggestions matching query', async () => {
      mockDatabase.category.findMany.mockResolvedValueOnce([
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
      ]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'elec' },
      });

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
  });

  describe('Combined Suggestions Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should combine all suggestion types', async () => {
      mockDatabase.product.findMany.mockResolvedValueOnce([mockProducts[0]]);
      mockDatabase.product.groupBy.mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
      ]);
      mockDatabase.category.findMany.mockResolvedValueOnce([
        {
          id: 'cat_1',
          name: 'Electronics',
          _count: { Product: 50 },
        },
      ]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(3);
      
      const types = data.map((s: any) => s.type);
      expect(types).toContain('product');
      expect(types).toContain('brand');
      expect(types).toContain('category');
    });

    it('should limit total suggestions to 7', async () => {
      // Mock more than 7 total suggestions
      mockDatabase.product.findMany.mockResolvedValueOnce([
        ...mockProducts,
        ...mockProducts,
      ]);
      mockDatabase.product.groupBy.mockResolvedValueOnce([
        { brand: 'Apple', _count: { brand: 10 } },
        { brand: 'Samsung', _count: { brand: 8 } },
        { brand: 'Google', _count: { brand: 5 } },
      ]);
      mockDatabase.category.findMany.mockResolvedValueOnce([
        { id: 'cat_1', name: 'Electronics', _count: { Product: 50 } },
        { id: 'cat_2', name: 'Clothing', _count: { Product: 30 } },
        { id: 'cat_3', name: 'Books', _count: { Product: 20 } },
      ]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(7);
    });
  });

  describe('Error Handling Tests', () => {
    beforeEach(() => {
      mockAuth.mockReturnValue({ userId: 'user_123' });
    });

    it('should return empty array on database error', async () => {
      mockDatabase.product.findMany.mockRejectedValueOnce(
        new Error('Database connection failed')
      );

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual([]);
    });

    it('should handle partial failures gracefully', async () => {
      mockDatabase.product.findMany.mockResolvedValueOnce([mockProducts[0]]);
      mockDatabase.product.groupBy.mockRejectedValueOnce(new Error('GroupBy failed'));
      mockDatabase.category.findMany.mockResolvedValueOnce([]);

      const { GET } = await import('../../app/api/search/suggestions/route');

      const request = createMockRequest('http://localhost:3000/api/search/suggestions', {
        searchParams: { q: 'test' },
      });

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBeGreaterThan(0);
    });
  });
});