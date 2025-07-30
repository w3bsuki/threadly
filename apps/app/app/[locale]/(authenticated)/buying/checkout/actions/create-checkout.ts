'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/tooling/observability/server';
import { redirect } from 'next/navigation';

export async function createCheckoutSession(productId: string) {
  try {
    const user = await currentUser();
    if (!user) {
      redirect('/sign-in');
    }

    // Get product details
    const product = await database.product.findUnique({
      where: {
        id: productId,
        status: 'AVAILABLE',
      },
      include: {
        seller: true,
        images: true,
      },
    });

    if (!product) {
      throw new Error('Product not found or no longer available');
    }

    // Ensure user is not buying their own product
    if (product.sellerId === user.id) {
      throw new Error('You cannot buy your own product');
    }

    // Get or create a default shipping address for the user
    let defaultAddress = await database.address.findFirst({
      where: {
        userId: user.id,
        isDefault: true,
        type: 'SHIPPING',
      },
    });

    if (!defaultAddress) {
      // Create a placeholder address that will be updated during checkout
      defaultAddress = await database.address.create({
        data: {
          userId: user.id,
          firstName: user.firstName || 'TBD',
          lastName: user.lastName || 'TBD',
          streetLine1: 'To be provided during checkout',
          city: 'TBD',
          state: 'TBD',
          zipCode: '00000',
          country: 'US',
          isDefault: true,
          type: 'SHIPPING',
        },
      });
    }

    // Create order with PENDING status
    const order = await database.order.create({
      data: {
        buyerId: user.id,
        sellerId: product.sellerId,
        productId: product.id,
        amount: product.price,
        status: 'PENDING',
        shippingAddressId: defaultAddress.id,
      },
    });

    // Mark product as RESERVED to prevent double purchases
    await database.product.update({
      where: { id: productId },
      data: { status: 'RESERVED' },
    });

    return {
      success: true,
      order,
      product,
    };
  } catch (error) {
    logError('Failed to create checkout session:', error);

    // If product was reserved but order failed, restore it
    try {
      await database.product.update({
        where: { id: productId },
        data: { status: 'AVAILABLE' },
      });
    } catch (e) {
      // Ignore cleanup errors
    }

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Failed to create checkout session',
    };
  }
}
