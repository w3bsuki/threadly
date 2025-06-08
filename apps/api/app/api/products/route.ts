import { auth } from '@repo/auth/server';
import { database } from '@repo/database';
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { 
  createProductSchema,
  productConditionSchema,
  priceSchema,
  safeTextSchema,
  paginationSchema,
} from '@repo/validation/schemas/product';
import { 
  withValidation, 
  validateQuery, 
  formatZodErrors,
  createSizeLimitMiddleware,
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

// Enhanced schema for creating a product with validation
const createProductInput = z.object({
  title: safeTextSchema
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters')
    .refine((title) => isValidProductTitle(title), {
      message: 'Invalid product title format',
    })
    .refine((title) => !containsProfanity(title), {
      message: 'Product title contains inappropriate content',
    }),
  description: safeTextSchema
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters'),
  price: priceSchema.refine((price) => isPriceInRange(price), {
    message: 'Price must be between $0.01 and $999,999.99',
  }),
  condition: productConditionSchema,
  categoryId: z.string().cuid('Invalid category ID'),
  brand: safeTextSchema.max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(
    z.string()
      .url('Invalid image URL')
      .refine((url) => isAllowedImageUrl(url, ['uploadthing.com', 'utfs.io']), {
        message: 'Image must be from an allowed source',
      })
  ).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed').optional(),
});

// Enhanced schema for listing products with better filtering
const listProductsInput = paginationSchema.extend({
  category: z.string().optional(),
  brand: safeTextSchema.max(50).optional(),
  condition: productConditionSchema.optional(),
  minPrice: priceSchema.optional(),
  maxPrice: priceSchema.optional(),
  search: safeTextSchema.max(100).optional(),
  sortBy: z.enum(['newest', 'price_asc', 'price_desc']).default('newest'),
});

// GET /api/products - List products with filtering
export async function GET(request: NextRequest) {
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

    // Validate query parameters
    const validation = validateQuery(request, listProductsInput);
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid parameters',
          details: validation.errors,
        },
        { status: 400 }
      );
    }
    
    const {
      page,
      limit,
      category,
      brand,
      condition,
      minPrice,
      maxPrice,
      search,
      sortBy,
    } = validation.data;

    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
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
        mode: 'insensitive',
      };
    }

    if (condition) {
      where.condition = condition;
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }

    if (search) {
      // Sanitize search term
      const sanitizedSearch = sanitizeForDisplay(search);
      where.OR = [
        {
          title: {
            contains: sanitizedSearch,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: sanitizedSearch,
            mode: 'insensitive',
          },
        },
        {
          brand: {
            contains: sanitizedSearch,
            mode: 'insensitive',
          },
        },
      ];
    }

    // Build orderBy clause
    let orderBy: any = {};
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
              order: 'asc',
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

    return NextResponse.json({
      success: true,
      data: {
        products,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Create a new product
export const POST = withValidation(
  async (request: NextRequest, validatedData: z.infer<typeof createProductInput>) => {
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

      // Check request size (5MB limit for product creation with images)
      const contentLength = request.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > 5 * 1024 * 1024) {
        return NextResponse.json(
          {
            success: false,
            error: 'Request too large. Maximum size: 5MB',
          },
          { status: 413 }
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

      // Sanitize user input
      const sanitizedData = {
        ...validatedData,
        title: filterProfanity(sanitizeForDisplay(validatedData.title)),
        description: sanitizeHtml(validatedData.description, {
          ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
          ALLOWED_ATTR: [],
        }),
        brand: validatedData.brand ? sanitizeForDisplay(validatedData.brand) : undefined,
      };

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

      // Verify category exists
      const category = await database.category.findUnique({
        where: { id: sanitizedData.categoryId },
      });

      if (!category) {
        return NextResponse.json(
          {
            success: false,
            error: 'Category not found',
          },
          { status: 404 }
        );
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
                  order: index,
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
              order: 'asc',
            },
          },
        },
      });

      return NextResponse.json(
        {
          success: true,
          data: { product },
          message: 'Product created successfully',
        },
        { status: 201 }
      );
    } catch (error) {
      console.error('Error creating product:', error);
      
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create product',
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
        },
        { status: 500 }
      );
    }
  },
  createProductInput,
  'body'
);