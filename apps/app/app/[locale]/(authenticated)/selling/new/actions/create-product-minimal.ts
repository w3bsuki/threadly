'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/observability/server';
import { redirect } from 'next/navigation';

export async function createProductMinimal(formData: FormData) {
  try {
    // Verify user authentication
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Get database user
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      // Create user if doesn't exist
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName,
          lastName: user.lastName,
          imageUrl: user.imageUrl,
        },
      });
    }

    // Get form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = Number.parseFloat(formData.get('price') as string);
    const categoryId = formData.get('categoryId') as string;

    // Create product with minimal data
    const product = await database.product.create({
      data: {
        title: title || 'Test Product',
        description: description || 'Test Description',
        price: price || 10,
        categoryId: categoryId || 'clz1234567890', // You'll need a real category ID
        condition: 'GOOD',
        sellerId: dbUser.id,
        status: 'AVAILABLE',
      },
    });

    return {
      success: true,
      productId: product.id,
    };
  } catch (error) {
    logError('Minimal create product error:', error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}
