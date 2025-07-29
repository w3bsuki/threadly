import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, rateLimitedProcedure } from '../config';
import { ProductStatus } from '@repo/database';

// Input validation schemas
const createProductSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(2000),
  price: z.number().positive().max(999999),
  categoryId: z.string().cuid(),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  images: z.array(z.string().url()).min(1).max(10),
  brand: z.string().min(1).max(50).optional(),
  model: z.string().min(1).max(50).optional(),
  color: z.string().min(1).max(30).optional(),
  size: z.string().min(1).max(30).optional(),
  weight: z.number().positive().optional(),
  dimensions: z.string().max(100).optional(),
});

const updateProductSchema = createProductSchema.partial().extend({
  id: z.string().cuid(),
});

const listProductsSchema = z.object({
  cursor: z.string().optional(),
  limit: z.number().min(1).max(50).default(20),
  categoryId: z.string().cuid().optional(),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']).optional(),
  minPrice: z.number().positive().optional(),
  maxPrice: z.number().positive().optional(),
  sellerId: z.string().cuid().optional(),
  search: z.string().max(100).optional(),
  sortBy: z.enum(['createdAt', 'price', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

/**
 * Products router
 * 
 * Handles all product-related operations including CRUD, search, and filtering
 */
export const productsRouter = createTRPCRouter({
  /**
   * Get paginated list of products with filtering and search
   */
  list: rateLimitedProcedure
    .input(listProductsSchema)
    .query(async ({ ctx, input }) => {
      const {
        cursor,
        limit,
        categoryId,
        condition,
        minPrice,
        maxPrice,
        sellerId,
        search,
        sortBy,
        sortOrder,
      } = input;

      // Build where clause
      const where: any = {
        status: ProductStatus.AVAILABLE,
      };

      if (categoryId) where.categoryId = categoryId;
      if (condition) where.condition = condition;
      if (sellerId) where.sellerId = sellerId;
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = minPrice;
        if (maxPrice) where.price.lte = maxPrice;
      }
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { brand: { contains: search, mode: 'insensitive' } },
        ];
      }

      // Cursor pagination
      if (cursor) {
        where.id = { lt: cursor };
      }

      const products = await ctx.database.product.findMany({
        where,
        take: limit + 1, // Take one extra to determine if there are more
        orderBy: { [sortBy]: sortOrder },
        include: {
          images: {
            select: { imageUrl: true },
            take: 1, // Only first image for list view
          },
          category: {
            select: { name: true },
          },
          seller: {
            select: { firstName: true, lastName: true },
          },
          _count: {
            select: { favorites: true },
          },
        },
      });

      // Determine next cursor
      let nextCursor: string | undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id;
      }

      return {
        products: products.map(product => ({
          ...product,
          imageUrl: product.images[0]?.imageUrl || null,
          favoriteCount: product._count.favorites,
        })),
        nextCursor,
        hasMore: !!nextCursor,
      };
    }),

  /**
   * Get single product by ID with full details
   */
  byId: rateLimitedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const product = await ctx.database.product.findUnique({
        where: { id: input.id },
        include: {
          images: true,
          category: true,
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              _count: {
                select: { Product: true },
              },
            },
          },
          // Reviews will be added when schema is confirmed
          // ProductReview: {
          //   include: {
          //     reviewer: {
          //       select: { firstName: true, lastName: true },
          //     },
          //   },
          //   orderBy: { createdAt: 'desc' },
          //   take: 5,
          // },
          _count: {
            select: { favorites: true },
          },
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      return {
        ...product,
        favoriteCount: product._count.favorites,
        reviewCount: 0, // Will be implemented when schema is confirmed
        averageRating: null, // Will be implemented when schema is confirmed
      };
    }),

  /**
   * Create new product (authenticated sellers only)
   */
  create: protectedProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { images, ...productData } = input;

      try {
        const product = await ctx.database.product.create({
          data: {
            ...productData,
            sellerId: dbUser.id,
            images: {
              create: images.map((url, index) => ({
                imageUrl: url,
                displayOrder: index,
              })),
            },
          },
          include: {
            images: true,
            category: true,
          },
        });

        return product;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create product',
        });
      }
    }),

  /**
   * Update existing product (owner only)
   */
  update: protectedProcedure
    .input(updateProductSchema)
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { id, images, ...rawUpdateData } = input;
      
      // Remove any undefined values from updateData
      const updateData = Object.fromEntries(
        Object.entries(rawUpdateData).filter(([_, value]) => value !== undefined)
      );

      // Check ownership
      const existingProduct = await ctx.database.product.findUnique({
        where: { id },
        select: { sellerId: true },
      });

      if (!existingProduct) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      if (existingProduct.sellerId !== dbUser.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own products',
        });
      }

      try {
        const product = await ctx.database.product.update({
          where: { id },
          data: {
            ...updateData,
            ...(images && {
              images: {
                deleteMany: {},
                create: images.map((url, index) => ({
                  imageUrl: url,
                  displayOrder: index,
                })),
              },
            }),
          },
          include: {
            images: true,
            category: true,
          },
        });

        return product;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update product',
        });
      }
    }),

  /**
   * Delete product (owner only)
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;

      // Check ownership
      const product = await ctx.database.product.findUnique({
        where: { id: input.id },
        select: { sellerId: true, status: true },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      if (product.sellerId !== dbUser.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only delete your own products',
        });
      }

      if (product.status === ProductStatus.SOLD) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot delete sold products',
        });
      }

      try {
        await ctx.database.product.delete({
          where: { id: input.id },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to delete product',
        });
      }
    }),

  /**
   * Get products by seller (for seller dashboard)
   */
  bySeller: protectedProcedure
    .input(z.object({
      cursor: z.string().optional(),
      limit: z.number().min(1).max(50).default(20),
      status: z.nativeEnum(ProductStatus).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      const { cursor, limit, status } = input;

      const where: any = { sellerId: dbUser.id };
      if (status) where.status = status;
      if (cursor) where.id = { lt: cursor };

      const products = await ctx.database.product.findMany({
        where,
        take: limit + 1,
        orderBy: { createdAt: 'desc' },
        include: {
          images: {
            select: { imageUrl: true },
            take: 1,
          },
          category: {
            select: { name: true },
          },
          _count: {
            select: { favorites: true },
          },
        },
      });

      let nextCursor: string | undefined;
      if (products.length > limit) {
        const nextItem = products.pop();
        nextCursor = nextItem?.id;
      }

      return {
        products: products.map(product => ({
          ...product,
          imageUrl: product.images[0]?.imageUrl || null,
          favoriteCount: product._count.favorites,
        })),
        nextCursor,
        hasMore: !!nextCursor,
      };
    }),
});