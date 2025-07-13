'use server';

import { canModerate } from '@repo/auth/admin';
import { database } from '@repo/database';
import { revalidatePath } from 'next/cache';
import { log } from '@repo/observability/server';

export async function approveProduct(productId: string) {
  const isModerator = await canModerate();
  if (!isModerator) {
    throw new Error('Unauthorized');
  }
  
  // You could add a "verified" field to products
  // For now, we'll just ensure it's available
  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' }
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
      seller: { select: { id: true } }
    }
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  // Update product status
  await database.product.update({
    where: { id: productId },
    data: { status: 'REMOVED' }
  });
  
  // Send notification to seller
  await database.notification.create({
    data: {
      id: crypto.randomUUID(),
      userId: product.seller.id,
      title: 'Product Removed',
      message: `Your product "${product.title}" has been removed from the marketplace. Reason: ${reason}`,
      type: 'SYSTEM',
      metadata: JSON.stringify({
        productId: productId,
        action: 'removed',
        reason: reason,
      }),
    },
  });
  
  // Cancel any pending orders for this product
  await database.order.updateMany({
    where: {
      productId: productId,
      status: 'PENDING'
    },
    data: {
      status: 'CANCELLED'
    }
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
      seller: { select: { id: true } }
    }
  });
  
  if (!product) {
    throw new Error('Product not found');
  }
  
  await database.product.update({
    where: { id: productId },
    data: { status: 'AVAILABLE' }
  });
  
  // Notify seller that product was restored
  await database.notification.create({
    data: {
      id: crypto.randomUUID(),
      userId: product.seller.id,
      title: 'Product Restored',
      message: `Your product "${product.title}" has been restored and is now available for sale again.`,
      type: 'SYSTEM',
      metadata: JSON.stringify({
        productId: productId,
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

  let updateData: any;
  
  switch (action) {
    case 'remove':
      updateData = { status: 'REMOVED' };
      break;
    case 'restore':
      updateData = { status: 'AVAILABLE' };
      break;
    case 'archive':
      updateData = { status: 'ARCHIVED' };
      break;
    default:
      throw new Error('Invalid action');
  }

  try {
    // Get products with seller info for notifications
    const products = await database.product.findMany({
      where: { id: { in: productIds } },
      include: {
        seller: { select: { id: true } }
      }
    });

    // Update products
    await database.product.updateMany({
      where: {
        id: { in: productIds }
      },
      data: updateData
    });

    // Send notifications to sellers
    const notifications = products.map(product => ({
      id: crypto.randomUUID(),
      userId: product.seller.id,
      title: `Product ${action === 'remove' ? 'Removed' : action === 'restore' ? 'Restored' : 'Archived'}`,
      message: `Your product "${product.title}" has been ${action === 'remove' ? 'removed from' : action === 'restore' ? 'restored to' : 'archived from'} the marketplace.`,
      type: 'SYSTEM' as const,
      metadata: JSON.stringify({
        productId: product.id,
        action: action,
        bulkOperation: true,
      }),
    }));

    await database.notification.createMany({
      data: notifications
    });

    // Cancel pending orders if removing products
    if (action === 'remove') {
      await database.order.updateMany({
        where: {
          productId: { in: productIds },
          status: 'PENDING'
        },
        data: {
          status: 'CANCELLED'
        }
      });
    }

    revalidatePath('/admin/products');
    return { success: true, count: productIds.length };
  } catch (error) {
    throw new Error('Failed to update products');
  }
}