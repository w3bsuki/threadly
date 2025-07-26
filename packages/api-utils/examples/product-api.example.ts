import { NextRequest } from 'next/server'
import { z } from 'zod'
import {
  createApiHandler,
  ResponseBuilder,
  RequestValidator,
  Sanitizer,
  requireAuth,
  rateLimitPresets,
} from '@repo/api-utils'
import { prisma } from '@repo/database'

// Define schemas
const createProductSchema = z.object({
  title: z.string().min(3).max(255),
  description: z.string().min(10).max(5000),
  price: z.number().positive().max(100000),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  size: z.string().optional(),
  brand: z.string().optional(),
  color: z.string().optional(),
  categoryId: z.string().cuid(),
  images: z.array(z.object({
    url: z.string().url(),
    alt: z.string().optional(),
  })).min(1).max(10),
})

const listProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().cuid().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']).optional(),
  sortBy: z.enum(['price', 'createdAt', 'views']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
})

// Example 1: Create Product Endpoint
export const POST = createApiHandler(
  requireAuth(async (req, params, user) => {
    // Validate request body
    const data = await RequestValidator.validateBody(req, createProductSchema)
    
    // Sanitize text fields
    const sanitizedData = {
      ...data,
      title: Sanitizer.sanitizeString(data.title),
      description: Sanitizer.sanitizeString(data.description, { maxLength: 5000 }),
      brand: data.brand ? Sanitizer.sanitizeString(data.brand) : undefined,
    }

    // Create product in database
    const product = await prisma.product.create({
      data: {
        ...sanitizedData,
        sellerId: user.id,
        images: {
          create: sanitizedData.images.map((img, index) => ({
            imageUrl: img.url,
            alt: img.alt,
            displayOrder: index,
          })),
        },
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            imageUrl: true,
          },
        },
        category: true,
      },
    })

    return ResponseBuilder.created(product)
  }),
  {
    rateLimit: rateLimitPresets.standard,
    auth: { requireAuth: true, auditLog: true },
  }
)

// Example 2: List Products Endpoint
export const GET = createApiHandler(
  async (req) => {
    // Validate query parameters
    const filters = RequestValidator.validateQuery(req, listProductsSchema)
    
    // Build query conditions
    const where = {
      status: 'AVAILABLE',
      ...(filters.search && {
        OR: [
          { title: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { brand: { contains: filters.search, mode: 'insensitive' } },
        ],
      }),
      ...(filters.categoryId && { categoryId: filters.categoryId }),
      ...(filters.condition && { condition: filters.condition }),
      ...(filters.minPrice || filters.maxPrice) && {
        price: {
          ...(filters.minPrice && { gte: filters.minPrice }),
          ...(filters.maxPrice && { lte: filters.maxPrice }),
        },
      },
    }

    // Execute queries in parallel
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          images: {
            orderBy: { displayOrder: 'asc' },
            take: 1,
          },
          seller: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              imageUrl: true,
            },
          },
          _count: {
            select: { favorites: true },
          },
        },
        orderBy: { [filters.sortBy]: filters.sortOrder },
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.product.count({ where }),
    ])

    return ResponseBuilder.paginated(products, {
      page: filters.page,
      limit: filters.limit,
      total,
    })
  },
  {
    rateLimit: { windowMs: 60000, maxRequests: 100 },
    auth: false,
  }
)

// Example 3: Update Product Endpoint with Versioning
export const PUT = createApiHandler(
  requireAuth(async (req, params, user) => {
    const { id } = params
    
    // Check ownership
    const product = await prisma.product.findUnique({
      where: { id },
      select: { sellerId: true },
    })

    if (!product) {
      throw ApiError.notFound('Product')
    }

    if (product.sellerId !== user.id) {
      throw ApiError.forbidden('You can only update your own products')
    }

    // Validate update data
    const updateData = await RequestValidator.validateBody(req, 
      createProductSchema.partial()
    )

    // Update product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: updateData,
      include: {
        images: true,
        category: true,
      },
    })

    return ResponseBuilder.success(updatedProduct)
  }),
  {
    auth: { requireAuth: true, auditLog: true },
    version: {
      defaultVersion: 'v1',
      supportedVersions: ['v1', 'v2'],
    },
  }
)