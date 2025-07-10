'use server';

import { currentUser } from '@repo/auth/server';
import { ensureUserExists } from '@repo/auth/db';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

// SECURITY: Enhanced validation schema with stricter rules
const createProductSchema = z.object({
  title: z.string().trim().min(3).max(100)
    .refine((val) => !/[<>\"'&]/.test(val), { message: "Title contains invalid characters" }),
  description: z.string().trim().min(10).max(2000),
  price: z.number().min(1).max(99999999),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']),
  brand: z.string().trim().max(50).optional()
    .refine((val) => !val || !/[<>\"'&]/.test(val), { message: "Brand contains invalid characters" }),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(z.string().url()).min(1).max(10),
  sellerId: z.string(),
});

// SECURITY: Basic input sanitization without external dependencies
function sanitizeUserInput(input: z.infer<typeof createProductSchema>) {
  // Basic HTML entity encoding for security
  const encodeHTML = (str: string) => {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  };

  return {
    ...input,
    title: encodeHTML(input.title.trim()),
    description: encodeHTML(input.description.trim()),
    brand: input.brand ? encodeHTML(input.brand.trim()) : null,
    size: input.size ? input.size.trim() : null,
    color: input.color ? input.color.trim() : null,
  };
}

export async function createProduct(input: z.infer<typeof createProductSchema>) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Ensure user exists in our database with sync fallback
    const dbUser = await ensureUserExists();
    if (!dbUser) {
      throw new Error('Failed to sync user to database');
    }

    // SECURITY: Validate and sanitize input
    const validatedInput = createProductSchema.parse(input);
    const sanitizedData = sanitizeUserInput(validatedInput);

    // Create the product in the database
    const product = await database.product.create({
      data: {
        title: sanitizedData.title,
        description: sanitizedData.description,
        price: sanitizedData.price / 100, // Convert cents to dollars for Decimal field
        categoryId: sanitizedData.categoryId,
        condition: sanitizedData.condition,
        brand: sanitizedData.brand,
        size: sanitizedData.size || null,
        color: sanitizedData.color || null,
        sellerId: dbUser.id, // Use the database user ID, not Clerk ID
        status: 'AVAILABLE',
        // Remove manual date setting - let Prisma handle it
        images: {
          create: sanitizedData.images.map((url, index) => ({
            imageUrl: url,
            alt: `${sanitizedData.title} - Image ${index + 1}`,
            displayOrder: index,
          })),
        },
      },
      include: {
        images: true,
      },
    });

    // Product is automatically searchable via database
    // UnifiedSearchService will use database search if Algolia is not configured
    log.info('Product created and searchable:', { 
      productId: product.id,
      searchMethod: process.env.ALGOLIA_APP_ID ? 'algolia' : 'database'
    });

    // Clear cache on web app so new products show immediately
    try {
      const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
      const adminSecret = process.env.ADMIN_SECRET || 'default-admin-secret';
      
      const response = await fetch(`${webUrl}/api/admin/clear-cache`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminSecret}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'products' }),
      });

      if (!response.ok) {
        throw new Error(`Cache clear failed: ${response.status}`);
      }

      log.info('Successfully cleared product cache on web app');
    } catch (cacheError) {
      // Log cache clearing errors but don't fail the product creation
      logError('Failed to clear cache on web app (non-critical):', cacheError);
    }
    
    return { success: true, productId: product.id };
  } catch (error) {
    logError('Error creating product:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to create product' 
    };
  }
}