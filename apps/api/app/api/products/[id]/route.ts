import { auth } from '@repo/auth/server';
import { database, type Prisma } from '@repo/database';
import { getCacheService } from '@repo/cache';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { searchIndexing } from '@/lib/search-init';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { logError } from '@repo/observability/server';
import { 
  updateProductSchema,
  productConditionSchema,
} from '@repo/validation/schemas/product';
import {
  priceSchema,
  safeTextSchema,
  cuidSchema,
} from '@repo/validation/schemas/common';
import { 
  withValidation, 
  validateBody,
  validateParams,
  formatZodErrors,
} from '@repo/validation/middleware';
import { 
  sanitizeForDisplay, 
  sanitizeHtml,
  filterProfanity,
  containsProfanity,
} from '@repo/validation/sanitize';
import { 
  isValidProductTitle,
  isAllowedImageUrl,
  isPriceInRange,
} from '@repo/validation/validators';

// Enhanced schema for updating a product
const updateProductInput = z.object({
  title: z.string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    })
    .refine((title) => isValidProductTitle(title), {
      message: 'Invalid product title format',
    })
    .refine((title) => !containsProfanity(title), {
      message: 'Product title contains inappropriate content',
    })
    .optional(),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    })
    .optional(),
  price: priceSchema
    .refine((price) => isPriceInRange(price), {
      message: 'Price must be between $0.01 and $999,999.99',
    })
    .optional(),
  condition: productConditionSchema.optional(),
  brand: z.string().trim().max(50).optional().nullable(),
  size: z.string().max(20).optional().nullable(),
  color: z.string().max(30).optional().nullable(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']).optional(),
  images: z.array(
    z.string()
      .url('Invalid image URL')
      .refine((url) => isAllowedImageUrl(url, ['uploadthing.com', 'utfs.io']), {
        message: 'Image must be from an allowed source',
      })
  ).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed').optional(),
});

// Schema for product ID parameter
const productIdSchema = z.object({
  id: cuidSchema,
});

// Initialize cache service
const cache = getCacheService({
  url: process.env.UPSTASH_REDIS_REST_URL || process.env.REDIS_URL || 'redis://localhost:6379',
  token: process.env.UPSTASH_REDIS_REST_TOKEN || undefined,
});

// GET /api/products/[id] - Get a specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    const resolvedParams = await params;
    const validation = validateParams(resolvedParams, productIdSchema);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { id } = validation.data;

    // Try cache first, then fallback to database
    const product = await cache.remember(
      `product:${id}`,
      async () => {
        const dbProduct = await database.product.findUnique({
          where: { id },
          include: {
            seller: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                imageUrl: true,
                averageRating: true,
                verified: true,
                totalSales: true,
                joinedAt: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
                parent: {
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
            images: {
              orderBy: {
                displayOrder: 'asc',
              },
            },
            _count: {
              select: {
                favorites: true,
              },
            },
          },
        });
        
        return dbProduct;
      },
      300 // Cache for 5 minutes
    );

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    // Increment view count (fire and forget)
    database.product.update({
      where: { id },
      data: { views: { increment: 1 } },
    }).catch(() => {
      // Ignore errors for view counting
    });

    // Add cache headers for browser caching
    const headers = new Headers();
    headers.set('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');

    return NextResponse.json({
      success: true,
      data: { product },
    }, { headers });
  } catch (error) {
    logError('Error fetching product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch product',
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update a specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Check authentication
    const user = await auth();
    if (!user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Validate params
    const resolvedParams = await params;
    const paramValidation = validateParams(resolvedParams, productIdSchema);
    if (!paramValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID',
          details: paramValidation.errors,
        },
        { status: 400 }
      );
    }

    const { id } = paramValidation.data;

    // Validate body
    const bodyValidation = await validateBody(request, updateProductInput);
    if (!bodyValidation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product data',
          details: bodyValidation.errors,
        },
        { status: 400 }
      );
    }

    const validatedData = bodyValidation.data;

    // Verify user exists in our database
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.userId },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if product exists and user owns it
    const existingProduct = await database.product.findUnique({
      where: { id },
      select: { sellerId: true },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    if (existingProduct.sellerId !== dbUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You can only edit your own products',
        },
        { status: 403 }
      );
    }

    // Sanitize and prepare update data
    const updateData: Prisma.ProductUpdateInput = {};
    
    // Only include fields that were provided and sanitize them
    if (validatedData.title !== undefined) {
      updateData.title = filterProfanity(sanitizeForDisplay(validatedData.title));
    }
    if (validatedData.description !== undefined) {
      updateData.description = sanitizeHtml(validatedData.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      });
    }
    if (validatedData.price !== undefined) updateData.price = validatedData.price;
    if (validatedData.condition !== undefined) updateData.condition = validatedData.condition;
    if (validatedData.brand !== undefined) {
      updateData.brand = validatedData.brand ? sanitizeForDisplay(validatedData.brand) : null;
    }
    if (validatedData.size !== undefined) updateData.size = validatedData.size;
    if (validatedData.color !== undefined) updateData.color = validatedData.color;
    if (validatedData.status !== undefined) updateData.status = validatedData.status;

    // Handle images update if provided
    if (validatedData.images) {
      // Delete existing images and create new ones
      updateData.images = {
        deleteMany: {},
        create: validatedData.images.map((url, index) => ({
          imageUrl: url,
          displayOrder: index,
        })),
      };
    }

    // Update the product
    const product = await database.product.update({
      where: { id },
      data: updateData,
      include: {
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        images: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    });

    // Invalidate cache for this product
    await cache.invalidateProduct(id);

    // Trigger search re-indexing (async, don't block response)
    searchIndexing.productUpdated(product.id).catch((error: unknown) => {
      logError('Failed to reindex updated product:', error);
    });

    return NextResponse.json({
      success: true,
      data: { product },
      message: 'Product updated successfully',
    });
  } catch (error) {
    logError('Error updating product:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update product',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id] - Delete a specific product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: rateLimitResult.error?.message || 'Rate limit exceeded',
        },
        { 
          status: 429,
          headers: rateLimitResult.headers,
        }
      );
    }

    // Check authentication
    const user = await auth();
    if (!user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required',
        },
        { status: 401 }
      );
    }

    // Validate params
    const resolvedParams = await params;
    const validation = validateParams(resolvedParams, productIdSchema);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid product ID',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const { id } = validation.data;

    // Verify user exists in our database
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.userId },
    });

    if (!dbUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'User not found',
        },
        { status: 404 }
      );
    }

    // Check if product exists and user owns it
    const existingProduct = await database.product.findUnique({
      where: { id },
      select: { 
        sellerId: true,
        status: true,
        orders: {
          where: {
            status: {
              in: ['PENDING', 'PAID', 'SHIPPED'],
            },
          },
          select: { id: true },
        },
      },
    });

    if (!existingProduct) {
      return NextResponse.json(
        {
          success: false,
          error: 'Product not found',
        },
        { status: 404 }
      );
    }

    if (existingProduct.sellerId !== dbUser.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Unauthorized: You can only delete your own products',
        },
        { status: 403 }
      );
    }

    // Check if there are active orders
    if (existingProduct.orders.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Cannot delete product with active orders',
        },
        { status: 400 }
      );
    }

    // Delete the product (CASCADE will handle related records)
    await database.product.delete({
      where: { id },
    });

    // Invalidate cache for this product
    await cache.invalidateProduct(id);

    // Remove from search index (async, don't block response)
    searchIndexing.productDeleted(id).catch((error: unknown) => {
      logError('Failed to remove deleted product from search index:', error);
    });

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully',
    });
  } catch (error) {
    logError('Error deleting product:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete product',
      },
      { status: 500 }
    );
  }
}