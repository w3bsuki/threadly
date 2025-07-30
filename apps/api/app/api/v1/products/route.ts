import { auth } from '@repo/auth/server';
import { database, type Prisma } from '@repo/database';
import { logError } from '@repo/tooling/observability/server';
import { checkRateLimit, generalApiLimit } from '@repo/auth/security';
import { validateBody, validateQuery } from '@repo/api/utils/src/validation/middleware';
import {
  containsProfanity,
  filterProfanity,
  sanitizeForDisplay,
  sanitizeHtml,
} from '@repo/api/utils/src/validation/sanitize';
import { paginationSchema, priceSchema } from '@repo/api/utils/src/validation/schemas/common';
import { productConditionSchema } from '@repo/api/utils/src/validation/schemas/product';
import {
  isAllowedImageUrl,
  isPriceInRange,
  isValidProductTitle,
} from '@repo/api/utils/src/validation/validators';
import type { NextRequest } from 'next/server';
import { z } from 'zod';
import { APIResponseBuilder } from '../../../../lib/api-response';

// Enhanced schema for listing products with better filtering
const listProductsInput = paginationSchema.extend({
  category: z.string().optional(),
  brand: z.string().trim().max(50).optional(),
  condition: productConditionSchema.optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  search: z.string().trim().max(100).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});

// Enhanced schema for creating a product with validation
const createProductInput = z.object({
  title: z
    .string()
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
    }),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
  price: priceSchema.refine((price) => isPriceInRange(price), {
    message: 'Price must be between $0.01 and $999,999.99',
  }),
  condition: productConditionSchema,
  categoryId: z.string().cuid('Invalid category ID'),
  brand: z.string().trim().max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z
    .array(
      z
        .string()
        .url('Invalid image URL')
        .refine(
          (url) => isAllowedImageUrl(url, ['uploadthing.com', 'utfs.io']),
          {
            message: 'Image must be from an allowed source',
          }
        )
    )
    .min(1, 'At least one image is required')
    .max(10, 'Maximum 10 images allowed')
    .optional(),
});

// GET /api/v1/products - List products with filtering
export async function GET(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return APIResponseBuilder.tooManyRequests(
        rateLimitResult.error?.message || 'Rate limit exceeded'
      );
    }

    // Validate query parameters
    const validation = validateQuery(request, listProductsInput);
    if (!validation.success) {
      return APIResponseBuilder.validationError(validation.errors);
    }

    const {
      page = 1,
      limit = 20,
      category,
      brand,
      condition,
      minPrice,
      maxPrice,
      search,
      sortBy = 'newest',
    } = validation.data;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: Prisma.ProductWhereInput = {
      status: 'AVAILABLE', // Only show available products
    };

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (brand) {
      where.brand = {
        contains: brand,
      };
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) {
        where.price.gte = minPrice;
      }
      if (maxPrice) {
        where.price.lte = maxPrice;
      }
    }

    if (search) {
      // Sanitize search term
      const sanitizedSearch = sanitizeForDisplay(search);
      where.OR = [
        {
          title: {
            contains: sanitizedSearch,
          },
        },
        {
          description: {
            contains: sanitizedSearch,
          },
        },
        {
          brand: {
            contains: sanitizedSearch,
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: Prisma.ProductOrderByWithRelationInput = {};
    switch (sortBy) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'price_asc':
        orderBy = { price: 'asc' };
        break;
      case 'price_desc':
        orderBy = { price: 'desc' };
        break;
    }

    // Get products and total count
    const [products, total] = await Promise.all([
      database.product.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
              averageRating: true,
              verified: true,
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
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      }),
      database.product.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return APIResponseBuilder.success(
      { products },
      'Products retrieved successfully',
      200,
      {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      }
    );
  } catch (error) {
    logError('Error fetching products:', error);
    return APIResponseBuilder.internalError('Failed to fetch products');
  }
}

// POST /api/v1/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    // Check rate limit
    const rateLimitResult = await checkRateLimit(generalApiLimit, request);
    if (!rateLimitResult.allowed) {
      return APIResponseBuilder.tooManyRequests(
        rateLimitResult.error?.message || 'Rate limit exceeded'
      );
    }

    // Check request size (5MB limit for product creation with images)
    const contentLength = request.headers.get('content-length');
    if (contentLength && Number.parseInt(contentLength, 10) > 5 * 1024 * 1024) {
      return APIResponseBuilder.badRequest(
        'Request too large. Maximum size: 5MB'
      );
    }

    // Check authentication
    const user = await auth();
    if (!user.userId) {
      return APIResponseBuilder.unauthorized();
    }

    // Validate body
    const bodyValidation = await validateBody(request, createProductInput);
    if (!bodyValidation.success) {
      return APIResponseBuilder.validationError(bodyValidation.errors);
    }

    const validatedData = bodyValidation.data;

    // Sanitize user input
    const sanitizedData = {
      ...validatedData,
      title: filterProfanity(sanitizeForDisplay(validatedData.title)),
      description: sanitizeHtml(validatedData.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      }),
      brand: validatedData.brand
        ? sanitizeForDisplay(validatedData.brand)
        : undefined,
    };

    // Verify user exists in our database
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.userId },
    });

    if (!dbUser) {
      return APIResponseBuilder.notFound('User');
    }

    // Verify category exists
    const category = await database.category.findUnique({
      where: { id: sanitizedData.categoryId },
    });

    if (!category) {
      return APIResponseBuilder.notFound('Category');
    }

    // Create the product
    const product = await database.product.create({
      data: {
        title: sanitizedData.title,
        description: sanitizedData.description,
        price: sanitizedData.price,
        condition: sanitizedData.condition,
        categoryId: sanitizedData.categoryId,
        sellerId: dbUser.id,
        brand: sanitizedData.brand,
        size: sanitizedData.size,
        color: sanitizedData.color,
        images: sanitizedData.images
          ? {
              create: sanitizedData.images.map((url, index) => ({
                imageUrl: url,
                displayOrder: index,
              })),
            }
          : undefined,
      },
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

    // Search indexing will be implemented when search service is configured

    return APIResponseBuilder.success(
      { product },
      'Product created successfully',
      201
    );
  } catch (error) {
    logError('Error creating product:', error);
    return APIResponseBuilder.internalError('Failed to create product');
  }
}
