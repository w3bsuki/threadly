'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { 
  productConditionSchema,
} from '@repo/validation/schemas/product';
import {
  priceCentsSchema,
  safeTextSchema,
  cuidSchema,
} from '@repo/validation/schemas/common';
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
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

const updateProductSchema = z.object({
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
    }),
  description: z.string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be at most 2000 characters')
    .refine((text) => !/<[^>]*>/.test(text), {
      message: 'HTML tags are not allowed',
    }),
  price: priceCentsSchema.refine((price) => price >= 1 && price <= 99999999, {
    message: 'Price must be between $0.01 and $999,999.99',
  }),
  categoryId: cuidSchema,
  condition: productConditionSchema,
  brand: z.string().trim().max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'REMOVED']),
  images: z.array(
    z.string()
      .url('Invalid image URL')
      .refine((url) => isAllowedImageUrl(url, ['uploadthing.com', 'utfs.io']), {
        message: 'Image must be from an allowed source',
      })
  ).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  sellerId: z.string(),
});

export async function updateProduct(productId: string, input: z.infer<typeof updateProductSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Validate input
    const validatedInput = updateProductSchema.parse(input);

    // Sanitize user input
    const sanitizedData = {
      ...validatedInput,
      title: filterProfanity(sanitizeForDisplay(validatedInput.title)),
      description: sanitizeHtml(validatedInput.description, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li'],
        ALLOWED_ATTR: [],
      }),
      brand: validatedInput.brand ? sanitizeForDisplay(validatedInput.brand) : null,
    };

    // Verify the user owns this product
    const existingProduct = await database.product.findUnique({
      where: {
        id: productId,
        sellerId: dbUser.id,
      },
      include: {
        images: true,
      },
    });

    if (!existingProduct) {
      throw new Error('Product not found or access denied');
    }

    // Update the product in a transaction
    const updatedProduct = await database.$transaction(async (tx) => {
      // Delete existing images
      await tx.productImage.deleteMany({
        where: {
          productId: productId,
        },
      });

      // Update the product
      const product = await tx.product.update({
        where: {
          id: productId,
        },
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price / 100, // Convert cents to dollars for database
          categoryId: sanitizedData.categoryId,
          condition: sanitizedData.condition,
          brand: sanitizedData.brand,
          size: sanitizedData.size || null,
          color: sanitizedData.color || null,
          status: sanitizedData.status,
          updatedAt: new Date(),
        },
      });

      // Add new images
      if (sanitizedData.images.length > 0) {
        await tx.productImage.createMany({
          data: sanitizedData.images.map((url, index) => ({
            productId: productId,
            imageUrl: url,
            alt: `${sanitizedData.title} - Image ${index + 1}`,
            displayOrder: index,
          })),
        });
      }

      return product;
    });

    return {
      success: true,
      product: updatedProduct,
    };

  } catch (error) {
    logError('Failed to update product:', error);
    
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update product',
    };
  }
}

export async function deleteProduct(productId: string) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get database user
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      throw new Error('User not found in database');
    }

    // Verify the user owns this product
    const existingProduct = await database.product.findUnique({
      where: {
        id: productId,
        sellerId: dbUser.id,
      },
    });

    if (!existingProduct) {
      throw new Error('Product not found or access denied');
    }

    // Check if product has any orders
    const ordersCount = await database.order.count({
      where: {
        productId: productId,
      },
    });

    if (ordersCount > 0) {
      // If product has orders, mark as deleted instead of actually deleting
      await database.product.update({
        where: {
          id: productId,
        },
        data: {
          status: 'REMOVED',
          title: `[DELETED] ${existingProduct.title}`,
        },
      });
    } else {
      // Safe to delete if no orders exist
      await database.$transaction(async (tx) => {
        // Delete images first
        await tx.productImage.deleteMany({
          where: {
            productId: productId,
          },
        });

        // Delete the product
        await tx.product.delete({
          where: {
            id: productId,
          },
        });
      });
    }

    return {
      success: true,
    };

  } catch (error) {
    logError('Failed to delete product:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete product',
    };
  }
}