'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { logError } from '@repo/observability/server';

export async function testFullProductCreation() {
  try {
    // 1. Check auth
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // 2. Get database user
    let dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      dbUser = await database.user.create({
        data: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress || '',
          firstName: user.firstName || null,
          lastName: user.lastName || null,
          imageUrl: user.imageUrl || null,
        }
      });
    }

    // 3. Get a category to use
    const category = await database.category.findFirst();
    if (!category) {
      throw new Error('No categories found. Please seed categories first.');
    }

    // 4. Create a test product
    const product = await database.product.create({
      data: {
        title: 'Test Product',
        description: 'This is a test product to verify selling functionality works.',
        price: 25.99, // $25.99 as decimal
        categoryId: category.id,
        condition: 'GOOD',
        sellerId: dbUser.id,
        status: 'AVAILABLE',
        images: {
          create: [{
            imageUrl: 'https://via.placeholder.com/300x300?text=Test+Product',
            alt: 'Test Product Image',
            displayOrder: 0,
          }]
        },
      },
      include: {
        images: true,
      },
    });

    return {
      success: true,
      productId: product.id,
      message: 'Product created successfully!',
      data: {
        title: product.title,
        price: product.price,
        categoryId: product.categoryId,
        imageCount: product.images.length,
      }
    };

  } catch (error) {
    logError('Error in test product creation:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
    };
  }
}