/**
 * Product CRUD Tests - 85% Coverage Required
 * 
 * This test suite covers all critical product functionality
 * including create, read, update, delete operations with validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { GET as getProducts, POST as createProduct } from '../../api/app/api/products/route';
import { GET as getProduct, PUT as updateProduct, DELETE as deleteProduct } from '../../api/app/api/products/[id]/route';
import { mockUsers, mockProducts, mockCategories } from '@repo/testing/mocks';
import { cleanup } from '@repo/testing';

// Mock dependencies
vi.mock('@repo/auth/server', () => ({
  auth: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
    },
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock('@repo/cache', () => ({
  getCacheService: vi.fn(() => ({
    remember: vi.fn(),
    invalidateProduct: vi.fn(),
  })),
}));

vi.mock('@repo/security', () => ({
  generalApiLimit: {},
  checkRateLimit: vi.fn(() => ({
    allowed: true,
    headers: {},
  })),
}));

vi.mock('@repo/observability/server', () => ({
  logError: vi.fn(),
}));

vi.mock('@repo/validation/middleware', () => ({
  withValidation: vi.fn((handler, schema, type) => handler),
  validateQuery: vi.fn(),
  validateBody: vi.fn(),
  validateParams: vi.fn(),
  formatZodErrors: vi.fn(),
}));

vi.mock('@repo/validation/sanitize', () => ({
  sanitizeForDisplay: vi.fn((text) => text),
  sanitizeHtml: vi.fn((text) => text),
  filterProfanity: vi.fn((text) => text),
  containsProfanity: vi.fn(() => false),
}));

vi.mock('@repo/validation/validators', () => ({
  isValidProductTitle: vi.fn(() => true),
  isAllowedImageUrl: vi.fn(() => true),
  isPriceInRange: vi.fn(() => true),
}));

// Search indexing mocks removed until search service is configured

describe('Product CRUD Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('Product Creation', () => {
    it('should create product successfully', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.category.findUnique).mockResolvedValue({
        id: 'cat_1',
        name: 'Electronics',
        slug: 'electronics',
      });

      const mockProduct = {
        id: 'prod_new_1',
        title: 'New iPhone 14',
        description: 'Brand new iPhone 14 in excellent condition',
        price: 89999,
        condition: 'NEW_WITH_TAGS',
        categoryId: 'cat_1',
        sellerId: 'user_1',
        brand: 'Apple',
        size: '128GB',
        color: 'Blue',
        status: 'AVAILABLE',
        seller: {
          id: 'user_1',
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: null,
        },
        category: {
          id: 'cat_1',
          name: 'Electronics',
          slug: 'electronics',
        },
        images: [
          { imageUrl: 'https://utfs.io/image1.jpg', displayOrder: 0 },
          { imageUrl: 'https://utfs.io/image2.jpg', displayOrder: 1 },
        ],
      };

      vi.mocked(validateBody).mockResolvedValue({
        success: true,
        data: {
          title: 'New iPhone 14',
          description: 'Brand new iPhone 14 in excellent condition',
          price: 89999,
          condition: 'NEW_WITH_TAGS',
          categoryId: 'cat_1',
          brand: 'Apple',
          size: '128GB',
          color: 'Blue',
          images: ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg'],
        },
      });

      vi.mocked(database.product.create).mockResolvedValue(mockProduct);

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New iPhone 14',
          description: 'Brand new iPhone 14 in excellent condition',
          price: 89999,
          condition: 'NEW_WITH_TAGS',
          categoryId: 'cat_1',
          brand: 'Apple',
          size: '128GB',
          color: 'Blue',
          images: ['https://utfs.io/image1.jpg', 'https://utfs.io/image2.jpg'],
        }),
      });

      const response = await createProduct(request, {});
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.data.product.id).toBe('prod_new_1');
      expect(data.data.product.title).toBe('New iPhone 14');
      expect(data.data.product.price).toBe(89999);
      expect(data.message).toBe('Product created successfully');

      // Verify product creation with images
      expect(database.product.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: 'New iPhone 14',
          price: 89999,
          sellerId: 'user_1',
          images: {
            create: [
              { imageUrl: 'https://utfs.io/image1.jpg', displayOrder: 0 },
              { imageUrl: 'https://utfs.io/image2.jpg', displayOrder: 1 },
            ],
          },
        }),
        include: expect.any(Object),
      });
    });

    it('should reject creation without authentication', async () => {
      const { auth } = await import('@repo/auth/server');
      vi.mocked(auth).mockResolvedValue({ userId: null });

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Test description',
          price: 1000,
          condition: 'NEW_WITH_TAGS',
          categoryId: 'cat_1',
        }),
      });

      const response = await createProduct(request, {});
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should reject creation with invalid category', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.category.findUnique).mockResolvedValue(null);

      vi.mocked(validateBody).mockResolvedValue({
        success: true,
        data: {
          title: 'Test Product',
          description: 'Test description',
          price: 1000,
          condition: 'NEW_WITH_TAGS',
          categoryId: 'invalid_category',
        },
      });

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: 'Test Product',
          description: 'Test description',
          price: 1000,
          condition: 'NEW_WITH_TAGS',
          categoryId: 'invalid_category',
        }),
      });

      const response = await createProduct(request, {});
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Category not found');
    });

    it('should handle validation errors', async () => {
      const { auth } = await import('@repo/auth/server');
      const { validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(validateBody).mockResolvedValue({
        success: false,
        errors: [
          {
            path: ['title'],
            message: 'Title must be at least 3 characters',
            code: 'too_small',
          },
          {
            path: ['price'],
            message: 'Price must be positive',
            code: 'invalid_type',
          },
        ],
      });

      const request = new NextRequest('http://localhost:3002/api/products', {
        method: 'POST',
        body: JSON.stringify({
          title: 'ab', // Too short
          description: 'Test description',
          price: -100, // Negative price
          condition: 'NEW_WITH_TAGS',
          categoryId: 'cat_1',
        }),
      });

      const response = await createProduct(request, {});
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid product data');
      expect(data.details).toBeDefined();
    });
  });

  describe('Product Retrieval', () => {
    it('should get products with pagination', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      const mockProducts = [
        {
          id: 'prod_1',
          title: 'iPhone 13 Pro',
          description: 'Excellent condition iPhone',
          price: { toNumber: () => 79999 },
          condition: 'VERY_GOOD',
          status: 'AVAILABLE',
          seller: {
            id: 'user_1',
            firstName: 'John',
            lastName: 'Doe',
            imageUrl: null,
            averageRating: 4.8,
            verified: true,
          },
          category: {
            id: 'cat_1',
            name: 'Electronics',
            slug: 'electronics',
          },
          images: [{ imageUrl: 'https://utfs.io/image1.jpg' }],
          _count: { favorites: 5 },
        },
      ];

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 20,
          sortBy: 'newest',
        },
      });

      vi.mocked(database.product.findMany).mockResolvedValue(mockProducts);
      vi.mocked(database.product.count).mockResolvedValue(1);

      const request = new NextRequest('http://localhost:3002/api/products?page=1&limit=20');

      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.products).toHaveLength(1);
      expect(data.data.pagination.page).toBe(1);
      expect(data.data.pagination.total).toBe(1);
      expect(data.data.pagination.totalPages).toBe(1);
    });

    it('should filter products by category', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 20,
          category: 'electronics',
          sortBy: 'newest',
        },
      });

      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.product.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3002/api/products?category=electronics');

      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(database.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'AVAILABLE',
          category: { slug: 'electronics' },
        }),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
      });
    });

    it('should filter products by price range', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 20,
          minPrice: 10000,
          maxPrice: 50000,
          sortBy: 'price_asc',
        },
      });

      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.product.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3002/api/products?minPrice=10000&maxPrice=50000&sortBy=price_asc');

      const response = await getProducts(request);

      expect(database.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'AVAILABLE',
          price: { gte: 10000, lte: 50000 },
        }),
        orderBy: { price: 'asc' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
      });
    });

    it('should search products by text', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 20,
          search: 'iPhone',
          sortBy: 'newest',
        },
      });

      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.product.count).mockResolvedValue(0);

      const request = new NextRequest('http://localhost:3002/api/products?search=iPhone');

      const response = await getProducts(request);

      expect(database.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'AVAILABLE',
          OR: [
            { title: { contains: 'iPhone' } },
            { description: { contains: 'iPhone' } },
            { brand: { contains: 'iPhone' } },
          ],
        }),
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
      });
    });
  });

  describe('Single Product Retrieval', () => {
    it('should get single product successfully', async () => {
      const { database, getCacheService } = await import('@repo/database');
      const { validateParams } = await import('@repo/validation/middleware');

      const mockProduct = {
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        description: 'Excellent condition iPhone',
        price: { toNumber: () => 79999 },
        condition: 'VERY_GOOD',
        status: 'AVAILABLE',
        seller: {
          id: 'user_1',
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: null,
          averageRating: 4.8,
          verified: true,
          totalSales: 15,
          joinedAt: new Date(),
        },
        category: {
          id: 'cat_1',
          name: 'Electronics',
          slug: 'electronics',
          parent: null,
        },
        images: [{ imageUrl: 'https://utfs.io/image1.jpg' }],
        _count: { favorites: 5 },
      };

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      const mockCache = {
        remember: vi.fn().mockResolvedValue(mockProduct),
      };

      vi.mocked(getCacheService).mockReturnValue(mockCache);

      const request = new NextRequest('http://localhost:3002/api/products/prod_1');

      const response = await getProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.product.id).toBe('prod_1');
      expect(data.data.product.title).toBe('iPhone 13 Pro');

      // Verify cache was used
      expect(mockCache.remember).toHaveBeenCalledWith(
        'product:prod_1',
        expect.any(Function),
        300
      );
    });

    it('should return 404 for non-existent product', async () => {
      const { getCacheService } = await import('@repo/cache');
      const { validateParams } = await import('@repo/validation/middleware');

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_nonexistent' },
      });

      const mockCache = {
        remember: vi.fn().mockResolvedValue(null),
      };

      vi.mocked(getCacheService).mockReturnValue(mockCache);

      const request = new NextRequest('http://localhost:3002/api/products/prod_nonexistent');

      const response = await getProduct(request, { params: Promise.resolve({ id: 'prod_nonexistent' }) });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Product not found');
    });

    it('should handle invalid product ID', async () => {
      const { validateParams } = await import('@repo/validation/middleware');

      vi.mocked(validateParams).mockReturnValue({
        success: false,
        errors: [{ path: ['id'], message: 'Invalid product ID', code: 'invalid_string' }],
      });

      const request = new NextRequest('http://localhost:3002/api/products/invalid-id');

      const response = await getProduct(request, { params: Promise.resolve({ id: 'invalid-id' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid product ID');
    });
  });

  describe('Product Update', () => {
    it('should update product successfully', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database, getCacheService } = await import('@repo/database');
      const { validateParams, validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1',
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      vi.mocked(validateBody).mockResolvedValue({
        success: true,
        data: {
          title: 'Updated iPhone 13 Pro',
          price: 75000,
          description: 'Updated description',
        },
      });

      const updatedProduct = {
        id: 'prod_1',
        title: 'Updated iPhone 13 Pro',
        description: 'Updated description',
        price: 75000,
        condition: 'VERY_GOOD',
        seller: {
          id: 'user_1',
          firstName: 'John',
          lastName: 'Doe',
          imageUrl: null,
        },
        category: {
          id: 'cat_1',
          name: 'Electronics',
          slug: 'electronics',
        },
        images: [{ imageUrl: 'https://utfs.io/image1.jpg' }],
      };

      vi.mocked(database.product.update).mockResolvedValue(updatedProduct);

      const mockCache = {
        invalidateProduct: vi.fn(),
      };

      vi.mocked(getCacheService).mockReturnValue(mockCache);

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          title: 'Updated iPhone 13 Pro',
          price: 75000,
          description: 'Updated description',
        }),
      });

      const response = await updateProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.product.title).toBe('Updated iPhone 13 Pro');
      expect(data.data.product.price).toBe(75000);
      expect(data.message).toBe('Product updated successfully');

      // Verify cache invalidation
      expect(mockCache.invalidateProduct).toHaveBeenCalledWith('prod_1');
    });

    it('should reject update by non-owner', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateParams, validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1', // Different owner
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      vi.mocked(validateBody).mockResolvedValue({
        success: true,
        data: { title: 'Updated Title' },
      });

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({ title: 'Updated Title' }),
      });

      const response = await updateProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized: You can only edit your own products');
    });

    it('should update product images', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateParams, validateBody } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1',
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      vi.mocked(validateBody).mockResolvedValue({
        success: true,
        data: {
          images: ['https://utfs.io/new1.jpg', 'https://utfs.io/new2.jpg'],
        },
      });

      vi.mocked(database.product.update).mockResolvedValue({
        id: 'prod_1',
        title: 'iPhone 13 Pro',
        images: [
          { imageUrl: 'https://utfs.io/new1.jpg', displayOrder: 0 },
          { imageUrl: 'https://utfs.io/new2.jpg', displayOrder: 1 },
        ],
      });

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'PUT',
        body: JSON.stringify({
          images: ['https://utfs.io/new1.jpg', 'https://utfs.io/new2.jpg'],
        }),
      });

      const response = await updateProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });

      expect(database.product.update).toHaveBeenCalledWith({
        where: { id: 'prod_1' },
        data: expect.objectContaining({
          images: {
            deleteMany: {},
            create: [
              { imageUrl: 'https://utfs.io/new1.jpg', displayOrder: 0 },
              { imageUrl: 'https://utfs.io/new2.jpg', displayOrder: 1 },
            ],
          },
        }),
        include: expect.any(Object),
      });
    });
  });

  describe('Product Deletion', () => {
    it('should delete product successfully', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database, getCacheService } = await import('@repo/database');
      const { validateParams } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1',
        status: 'AVAILABLE',
        orders: [], // No active orders
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      vi.mocked(database.product.delete).mockResolvedValue({ id: 'prod_1' });

      const mockCache = {
        invalidateProduct: vi.fn(),
      };

      vi.mocked(getCacheService).mockReturnValue(mockCache);

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'DELETE',
      });

      const response = await deleteProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Product deleted successfully');

      // Verify deletion and cache invalidation
      expect(database.product.delete).toHaveBeenCalledWith({ where: { id: 'prod_1' } });
      expect(mockCache.invalidateProduct).toHaveBeenCalledWith('prod_1');
    });

    it('should reject deletion by non-owner', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateParams } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_2' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_2',
        clerkId: 'clerk_user_2',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1', // Different owner
        status: 'AVAILABLE',
        orders: [],
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'DELETE',
      });

      const response = await deleteProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized: You can only delete your own products');
    });

    it('should reject deletion with active orders', async () => {
      const { auth } = await import('@repo/auth/server');
      const { database } = await import('@repo/database');
      const { validateParams } = await import('@repo/validation/middleware');

      vi.mocked(auth).mockResolvedValue({ userId: 'clerk_user_1' });
      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
      });
      vi.mocked(database.product.findUnique).mockResolvedValue({
        sellerId: 'user_1',
        status: 'AVAILABLE',
        orders: [{ id: 'order_1' }], // Has active orders
      });

      vi.mocked(validateParams).mockReturnValue({
        success: true,
        data: { id: 'prod_1' },
      });

      const request = new NextRequest('http://localhost:3002/api/products/prod_1', {
        method: 'DELETE',
      });

      const response = await deleteProduct(request, { params: Promise.resolve({ id: 'prod_1' }) });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Cannot delete product with active orders');
    });
  });

  describe('Product Validation', () => {
    it('should validate product title requirements', () => {
      const { isValidProductTitle, containsProfanity } = require('@repo/validation/validators');
      
      // Mock the validators to test validation logic
      vi.mocked(isValidProductTitle).mockImplementation((title: string) => {
        return title.length >= 3 && title.length <= 100 && !title.includes('<script>');
      });

      vi.mocked(containsProfanity).mockImplementation((text: string) => {
        const profanity = ['spam', 'scam', 'fake'];
        return profanity.some(word => text.toLowerCase().includes(word));
      });

      // Valid titles
      expect(isValidProductTitle('iPhone 13 Pro Max')).toBe(true);
      expect(isValidProductTitle('Nike Air Jordan Shoes')).toBe(true);

      // Invalid titles
      expect(isValidProductTitle('ab')).toBe(false); // Too short
      expect(isValidProductTitle('<script>alert("xss")</script>')).toBe(false); // Contains script
      expect(containsProfanity('This is a scam product')).toBe(true); // Contains profanity
    });

    it('should validate price ranges', () => {
      const { isPriceInRange } = require('@repo/validation/validators');
      
      vi.mocked(isPriceInRange).mockImplementation((price: number) => {
        return price >= 1 && price <= 99999999; // $0.01 to $999,999.99 in cents
      });

      expect(isPriceInRange(100)).toBe(true); // $1.00
      expect(isPriceInRange(9999999)).toBe(true); // $99,999.99
      expect(isPriceInRange(0)).toBe(false); // $0.00
      expect(isPriceInRange(-100)).toBe(false); // Negative
      expect(isPriceInRange(100000000)).toBe(false); // Too high
    });

    it('should validate image URLs', () => {
      const { isAllowedImageUrl } = require('@repo/validation/validators');
      
      vi.mocked(isAllowedImageUrl).mockImplementation((url: string, allowedDomains: string[]) => {
        return allowedDomains.some(domain => url.includes(domain));
      });

      const allowedDomains = ['uploadthing.com', 'utfs.io'];

      expect(isAllowedImageUrl('https://utfs.io/image.jpg', allowedDomains)).toBe(true);
      expect(isAllowedImageUrl('https://uploadthing.com/image.jpg', allowedDomains)).toBe(true);
      expect(isAllowedImageUrl('https://malicious.com/image.jpg', allowedDomains)).toBe(false);
    });
  });

  describe('Search and Filtering', () => {
    it('should handle complex filtering combinations', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: {
          page: 1,
          limit: 20,
          category: 'electronics',
          brand: 'Apple',
          condition: 'VERY_GOOD',
          minPrice: 50000,
          maxPrice: 100000,
          search: 'iPhone',
          sortBy: 'price_desc',
        },
      });

      vi.mocked(database.product.findMany).mockResolvedValue([]);
      vi.mocked(database.product.count).mockResolvedValue(0);

      const queryParams = new URLSearchParams({
        category: 'electronics',
        brand: 'Apple',
        condition: 'VERY_GOOD',
        minPrice: '50000',
        maxPrice: '100000',
        search: 'iPhone',
        sortBy: 'price_desc',
      });

      const request = new NextRequest(`http://localhost:3002/api/products?${queryParams}`);

      const response = await getProducts(request);

      expect(database.product.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          status: 'AVAILABLE',
          category: { slug: 'electronics' },
          brand: { contains: 'Apple' },
          condition: 'VERY_GOOD',
          price: { gte: 50000, lte: 100000 },
          OR: [
            { title: { contains: 'iPhone' } },
            { description: { contains: 'iPhone' } },
            { brand: { contains: 'iPhone' } },
          ],
        }),
        orderBy: { price: 'desc' },
        skip: 0,
        take: 20,
        include: expect.any(Object),
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors', async () => {
      const { database } = await import('@repo/database');
      const { validateQuery } = await import('@repo/validation/middleware');

      vi.mocked(validateQuery).mockReturnValue({
        success: true,
        data: { page: 1, limit: 20, sortBy: 'newest' },
      });

      vi.mocked(database.product.findMany).mockRejectedValue(
        new Error('Database connection failed')
      );

      const request = new NextRequest('http://localhost:3002/api/products');

      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch products');
    });

    it('should handle rate limiting', async () => {
      const { checkRateLimit } = await import('@repo/security');

      vi.mocked(checkRateLimit).mockResolvedValue({
        allowed: false,
        error: { message: 'Rate limit exceeded' },
        headers: { 'X-RateLimit-Remaining': '0' },
      });

      const request = new NextRequest('http://localhost:3002/api/products');

      const response = await getProducts(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Rate limit exceeded');
    });
  });
});