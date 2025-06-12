'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { logError } from '@repo/observability/error';

export async function testBypassProductCreation(formData: FormData) {
  try {
    // 1. Test authentication
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // 2. Get or create database user
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

    // 3. Get a category
    const category = await database.category.findFirst();
    if (!category) {
      throw new Error('No categories found');
    }

    // 4. Extract form data
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);

    if (!title || !description || !price) {
      throw new Error('Missing required fields');
    }

    // 5. Create product bypassing Stripe requirement
    const product = await database.product.create({
      data: {
        title,
        description,
        price: price, // Store as decimal
        categoryId: category.id,
        condition: 'GOOD',
        sellerId: dbUser.id,
        status: 'AVAILABLE',
        images: {
          create: [{
            imageUrl: 'https://via.placeholder.com/300x300?text=' + encodeURIComponent(title),
            alt: title + ' Image',
            displayOrder: 0,
          }]
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    return {
      success: true,
      message: '🎉 SELLING FLOW WORKS! Product created successfully!',
      data: {
        productId: product.id,
        title: product.title,
        price: product.price.toString(),
        categoryName: product.category.name,
        imageCount: product.images.length,
        userId: dbUser.id,
        userEmail: dbUser.email,
      }
    };

  } catch (error) {
    logError('Error in bypass product creation:', error);
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create product',
      details: error instanceof Error ? error.stack : undefined,
    };
  }
}