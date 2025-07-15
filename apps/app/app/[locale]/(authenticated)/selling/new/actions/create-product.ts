'use server';

import { currentUser } from '@repo/auth/server';
import { ensureUserExists } from '@repo/auth/sync';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';
import { getAlgoliaSyncService } from '@repo/search';

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
  draftId: z.string().optional(),
});

const saveDraftSchema = z.object({
  title: z.string().trim().max(100).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.number().min(0).max(99999999).optional(),
  categoryId: z.string().optional(),
  condition: z.enum(['NEW_WITH_TAGS', 'NEW_WITHOUT_TAGS', 'VERY_GOOD', 'GOOD', 'SATISFACTORY']).optional(),
  brand: z.string().trim().max(50).optional(),
  size: z.string().max(20).optional(),
  color: z.string().max(30).optional(),
  images: z.array(z.string().url()).max(10).optional(),
  sellerId: z.string(),
  id: z.string().optional(),
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

export async function createProduct(input: z.infer<typeof createProductSchema> & { draftId?: string }) {
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

    let product;

    if (input.draftId) {
      // Update existing draft to published status
      product = await database.product.update({
        where: {
          id: input.draftId,
          sellerId: dbUser.id,
          status: 'AVAILABLE'
        },
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price / 100,
          categoryId: sanitizedData.categoryId,
          condition: sanitizedData.condition,
          brand: sanitizedData.brand,
          size: sanitizedData.size || null,
          color: sanitizedData.color || null,
          status: 'AVAILABLE',
          images: {
            deleteMany: {},
            create: sanitizedData.images.map((url, index) => ({
              imageUrl: url,
              alt: `${sanitizedData.title} - Image ${index + 1}`,
              displayOrder: index,
            })),
          },
        },
        include: {
          images: true,
          category: true,
          seller: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
    } else {
      // Create new product
      product = await database.product.create({
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price / 100,
          categoryId: sanitizedData.categoryId,
          condition: sanitizedData.condition,
          brand: sanitizedData.brand,
          size: sanitizedData.size || null,
          color: sanitizedData.color || null,
          sellerId: dbUser.id,
          status: 'AVAILABLE',
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
          category: true,
          seller: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
    }

    // Index product to Algolia for search
    try {
      const algoliaSync = getAlgoliaSyncService();
      await algoliaSync.indexProduct(product);
      log.info('Product indexed to Algolia', { productId: product.id });
    } catch (algoliaError) {
      // Log error but don't fail product creation
      logError('Failed to index product to Algolia (non-critical):', algoliaError);
    }

    // Clear cache on web app so new products show immediately
    const webUrl = process.env.NEXT_PUBLIC_WEB_URL || 'http://localhost:3001';
    const adminSecret = process.env.ADMIN_SECRET || 'default-admin-secret';
    
    // Retry logic for cache clearing
    let cacheCleared = false;
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        log.info(`Attempting to clear cache on web app (attempt ${attempt}/${maxRetries})`, {
          webUrl,
          productId: product.id,
        });
        
        const response = await fetch(`${webUrl}/api/admin/clear-cache`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ type: 'products' }),
          // Add timeout to prevent hanging
          signal: AbortSignal.timeout(5000), // 5 second timeout
        });

        if (!response.ok) {
          const responseText = await response.text().catch(() => 'No response body');
          throw new Error(`Cache clear failed: ${response.status} ${response.statusText} - ${responseText}`);
        }

        const result = await response.json();
        log.info('Successfully cleared product cache on web app', {
          productId: product.id,
          webUrl,
          result,
        });
        cacheCleared = true;
        break;
      } catch (cacheError) {
        // Log detailed error information
        logError(`Failed to clear cache on web app (attempt ${attempt}/${maxRetries})`, {
          error: cacheError,
          productId: product.id,
          webUrl,
          errorMessage: cacheError instanceof Error ? cacheError.message : String(cacheError),
        });
        
        // If not the last attempt, wait before retrying
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        }
      }
    }
    
    if (!cacheCleared) {
      // Log final failure with context
      logError('Failed to clear cache after all retry attempts', {
        productId: product.id,
        webUrl,
        maxRetries,
        note: 'Product was created successfully but may not appear immediately in web app',
      });
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

export async function saveDraftProduct(input: z.infer<typeof saveDraftSchema>) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const dbUser = await ensureUserExists();
    if (!dbUser) {
      throw new Error('Failed to sync user to database');
    }

    const validatedInput = saveDraftSchema.parse(input);

    // Update existing draft or create new one
    const draftData = {
      title: validatedInput.title || '',
      description: validatedInput.description || '',
      price: validatedInput.price ? validatedInput.price / 100 : 0,
      categoryId: validatedInput.categoryId || '',
      condition: validatedInput.condition || 'GOOD',
      brand: validatedInput.brand || null,
      size: validatedInput.size || null,
      color: validatedInput.color || null,
      sellerId: dbUser.id,
      status: 'AVAILABLE' as const,
    };

    let product;

    if (validatedInput.id) {
      // Update existing draft
      product = await database.product.update({
        where: {
          id: validatedInput.id,
          sellerId: dbUser.id,
          status: 'AVAILABLE'
        },
        data: {
          ...draftData,
          images: validatedInput.images ? {
            deleteMany: {},
            create: validatedInput.images.map((url, index) => ({
              imageUrl: url,
              alt: `${draftData.title} - Image ${index + 1}`,
              displayOrder: index,
            })),
          } : undefined,
        }
      });
    } else {
      // Create new draft
      product = await database.product.create({
        data: {
          ...draftData,
          images: validatedInput.images ? {
            create: validatedInput.images.map((url, index) => ({
              imageUrl: url,
              alt: `${draftData.title} - Image ${index + 1}`,
              displayOrder: index,
            })),
          } : undefined,
        }
      });
    }

    return { success: true, draftId: product.id };
  } catch (error) {
    logError('Error saving draft product:', error);
    
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed',
        details: error.issues 
      };
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to save draft' 
    };
  }
}