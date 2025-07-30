'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/tooling/observability/server';
import { getAlgoliaSyncService } from '@repo/api/utils/search';
import {
  type CreateProductInput,
  createProductSchema,
} from '@repo/api/utils/validation';
import { redirect } from 'next/navigation';

function sanitizeUserInput(input: CreateProductInput) {
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
    brand: input.brand ? encodeHTML(input.brand.trim()) : undefined,
    size: input.size ? input.size.trim() : undefined,
    color: input.color ? input.color.trim() : undefined,
  };
}

export async function createProduct(
  input: CreateProductInput & { sellerId: string; draftId?: string }
) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    const validatedInput = createProductSchema.parse(input);
    const sanitizedData = sanitizeUserInput(validatedInput);

    // Find category by name to get the ID
    const category = await database.category.findFirst({
      where: { name: sanitizedData.category },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    let product;

    if (input.draftId) {
      product = await database.product.update({
        where: {
          id: input.draftId,
          sellerId: input.sellerId,
          status: 'AVAILABLE',
        },
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price,
          categoryId: category.id,
          condition: sanitizedData.condition,
          brand: sanitizedData.brand || null,
          size: sanitizedData.size || null,
          color: sanitizedData.color || null,
          status: 'AVAILABLE',
          images: {
            deleteMany: {},
            create: sanitizedData.images.map((image, index) => ({
              imageUrl: image.url,
              alt: image.alt || `${sanitizedData.title} - Image ${index + 1}`,
              displayOrder: image.order || index,
            })),
          },
        },
        include: {
          images: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
    } else {
      product = await database.product.create({
        data: {
          title: sanitizedData.title,
          description: sanitizedData.description,
          price: sanitizedData.price,
          categoryId: category.id,
          condition: sanitizedData.condition,
          brand: sanitizedData.brand || null,
          size: sanitizedData.size || null,
          color: sanitizedData.color || null,
          sellerId: input.sellerId,
          status: 'AVAILABLE',
          images: {
            create: sanitizedData.images.map((image, index) => ({
              imageUrl: image.url,
              alt: image.alt || `${sanitizedData.title} - Image ${index + 1}`,
              displayOrder: image.order || index,
            })),
          },
        },
        include: {
          images: true,
          _count: {
            select: {
              favorites: true,
            },
          },
        },
      });
    }

    try {
      const algoliaSync = getAlgoliaSyncService();
      await algoliaSync.indexProduct(product);
      log.info('Product indexed to Algolia', { productId: product.id });
    } catch (algoliaError) {
      logError(
        'Failed to index product to Algolia (non-critical):',
        algoliaError
      );
    }

    return { success: true, productId: product.id };
  } catch (error) {
    logError('Error creating product:', error);

    if (error instanceof Error && 'issues' in error) {
      return {
        success: false,
        error: 'Validation failed',
        details: (error as any).issues,
      };
    }

    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}

export async function saveDraftProduct(
  input: Partial<CreateProductInput> & { sellerId: string; id?: string }
) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Find category by name to get the ID
    const categoryName = input.category || 'WOMEN';
    const category = await database.category.findFirst({
      where: { name: categoryName },
    });

    if (!category) {
      throw new Error('Category not found');
    }

    const draftData = {
      title: input.title || '',
      description: input.description || '',
      price: input.price || 0,
      categoryId: category.id,
      condition: input.condition || 'GOOD',
      brand: input.brand || null,
      size: input.size || null,
      color: input.color || null,
      sellerId: input.sellerId,
      status: 'AVAILABLE' as const,
    };

    let product;

    if (input.id) {
      product = await database.product.update({
        where: {
          id: input.id,
          sellerId: input.sellerId,
          status: 'AVAILABLE',
        },
        data: {
          ...draftData,
          images: input.images
            ? {
                deleteMany: {},
                create: input.images.map((image, index) => ({
                  imageUrl: image.url,
                  alt: image.alt || `${draftData.title} - Image ${index + 1}`,
                  displayOrder: image.order || index,
                })),
              }
            : undefined,
        },
      });
    } else {
      product = await database.product.create({
        data: {
          ...draftData,
          images: input.images
            ? {
                create: input.images.map((image, index) => ({
                  imageUrl: image.url,
                  alt: image.alt || `${draftData.title} - Image ${index + 1}`,
                  displayOrder: image.order || index,
                })),
              }
            : undefined,
        },
      });
    }

    return { success: true, draftId: product.id };
  } catch (error) {
    logError('Error saving draft product:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save draft',
    };
  }
}
