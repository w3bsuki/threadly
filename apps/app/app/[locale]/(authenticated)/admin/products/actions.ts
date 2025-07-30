'use server';

import { canModerate } from '@/lib/auth/admin';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import type { ProductStatus } from '@repo/database/generated/client';
import { log } from '@repo/tooling/observability/server';
import type { BulkUpdateData } from '@repo/api/utils/validation/schemas';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import type {
  BulkOperationStatus,
  BulkOperationType,
} from '@/lib/database-types';

export async function approveProduct(productId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }

  // You could add a "verified" field to products
  // For now, we'll just ensure it's available
  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' },
  });

  revalidatePath('/admin/products');
  return { success: true };
}

export async function removeProduct(productId: string, reason: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }

  // Get product with seller info
  const product = await database.product.findUnique({
    where: { id: productId },
    include: {
      seller: { select: { id: true } },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  // Update product status
  await database.product.update({
    where: { id: productId },
    data: { status: 'REMOVED' },
  });

  // Send notification to seller
  await database.notification.create({
    data: {
      id: randomUUID(),
      userId: product.seller.id,
      title: 'Product Removed',
      message: `Your product "${product.title}" has been removed from the marketplace. Reason: ${reason}`,
      type: 'SYSTEM',
      metadata: JSON.stringify({
        productId,
        action: 'removed',
        reason,
      }),
    },
  });

  // Cancel any pending orders for this product
  await database.order.updateMany({
    where: {
      productId,
      status: 'PENDING',
    },
    data: {
      status: 'CANCELLED',
    },
  });

  revalidatePath('/admin/products');
  return { success: true };
}

export async function restoreProduct(productId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }

  // Get product with seller info
  const product = await database.product.findUnique({
    where: { id: productId },
    include: {
      seller: { select: { id: true } },
    },
  });

  if (!product) {
    throw new Error('Product not found');
  }

  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' },
  });

  // Notify seller that product was restored
  await database.notification.create({
    data: {
      id: randomUUID(),
      userId: product.seller.id,
      title: 'Product Restored',
      message: `Your product "${product.title}" has been restored and is now available for sale again.`,
      type: 'SYSTEM',
      metadata: JSON.stringify({
        productId,
        action: 'restored',
      }),
    },
  });

  revalidatePath('/admin/products');
  return { success: true };
}

export async function bulkUpdateProducts({
  productIds,
  action,
}: {
  productIds: string[];
  action: 'remove' | 'restore' | 'archive';
}) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized: Admin access required');
  }

  let updateData: { status: ProductStatus };

  switch (action) {
    case 'remove':
      updateData = { status: 'REMOVED' };
      break;
    case 'restore':
      updateData = { status: 'AVAILABLE' };
      break;
    case 'archive':
      updateData = { status: 'REMOVED' };
      break;
    default:
      throw new Error('Invalid action');
  }

  try {
    // Get products with seller info for notifications
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
      include: {
        seller: { select: { id: true } },
      },
    });

    // Update products
    await database.product.updateMany({
      where: {
        id: { in: productIds },
      },
      data: updateData,
    });

    // Send notifications to sellers
    const notifications = products.map((product) => ({
      id: randomUUID(),
      userId: product.seller.id,
      title: `Product ${action === 'remove' ? 'Removed' : action === 'restore' ? 'Restored' : 'Archived'}`,
      message: `Your product "${product.title}" has been ${action === 'remove' ? 'removed from' : action === 'restore' ? 'restored to' : 'archived from'} the marketplace.`,
      type: 'SYSTEM' as const,
      metadata: JSON.stringify({
        productId: product.id,
        action,
        bulkOperation: true,
      }),
    }));

    await database.notification.createMany({
      data: notifications,
    });

    // Cancel pending orders if removing products
    if (action === 'remove') {
      await database.order.updateMany({
        where: {
          productId: { in: productIds },
          status: 'PENDING',
        },
        data: {
          status: 'CANCELLED',
        },
      });
    }

    revalidatePath('/admin/products');
    return { success: true, count: productIds.length };
  } catch (error) {
    throw new Error('Failed to update products');
  }
}

export async function bulkUpdateSellerProducts({
  productIds,
  operation,
  data,
}: {
  productIds: string[];
  operation: BulkOperationType;
  data: BulkUpdateData;
}) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { id: true },
  });

  if (!dbUser) {
    throw new Error('User not found');
  }

  // Verify all products belong to the seller
  const products = await database.product.findMany({
    where: {
      id: { in: productIds },
      sellerId: dbUser.id,
    },
    select: { id: true, title: true },
  });

  if (products.length !== productIds.length) {
    throw new Error('Some products do not belong to you');
  }

  // Generate a temporary operation ID for tracking
  const operationId = randomUUID();

  try {
    let updateData: Record<string, unknown> = {};
    const results = { success: 0, errors: 0, skipped: 0 };

    switch (operation) {
      case 'PRICE_UPDATE':
        updateData = { price: data.price };
        break;
      case 'STATUS_CHANGE':
        updateData = { status: data.status };
        break;
      case 'CATEGORY_UPDATE':
        updateData = { categoryId: data.categoryId };
        break;
      case 'CONDITION_UPDATE':
        updateData = { condition: data.condition };
        break;
      case 'BRAND_UPDATE':
        updateData = { brand: data.brand };
        break;
      case 'SIZE_UPDATE':
        updateData = { size: data.size };
        break;
      case 'COLOR_UPDATE':
        updateData = { color: data.color };
        break;
      default:
        throw new Error('Invalid operation type');
    }

    // Process each product individually for better error tracking
    for (const product of products) {
      try {
        await database.product.update({
          where: { id: product.id },
          data: updateData,
        });
        results.success++;
      } catch (error) {
        log.error(
          `Failed to update product ${product.id}:`,
          error instanceof Error
            ? { message: error.message }
            : { error: String(error) }
        );
        results.errors++;
      }
    }

    // Log operation results
    log.info('Bulk operation completed', {
      operationId,
      processedItems: results.success + results.errors,
      successCount: results.success,
      errorCount: results.errors,
    });

    revalidatePath('/selling/listings');
    return {
      success: true,
      results,
      operationId,
      message: `Bulk update: ${results.success} successful, ${results.errors} errors`,
    };
  } catch (error) {
    // Log operation failure
    log.error('Bulk operation failed:', {
      operationId,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    log.error(
      'Bulk operation failed:',
      error instanceof Error
        ? { message: error.message }
        : { error: String(error) }
    );
    throw new Error('Failed to perform bulk update');
  }
}

export async function getBulkOperationStatus(operationId: string) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Return mock data since bulkOperation table doesn't exist
  return {
    id: operationId,
    status: 'COMPLETED' as BulkOperationStatus,
    createdAt: new Date(),
    completedAt: new Date(),
    totalItems: 0,
    processedItems: 0,
    successCount: 0,
    errorCount: 0,
  };
}

export async function getUserBulkOperations(limit = 10) {
  const user = await currentUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  // Return empty array since bulkOperation table doesn't exist
  return [];
}
