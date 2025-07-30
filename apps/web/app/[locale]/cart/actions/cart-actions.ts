'use server';

import { auth } from '@clerk/nextjs/server';
import type { CartItem } from '@repo/ui/commerce';
import { database } from '@repo/database';
import {
  parseError,
  setProductContext,
  setUserContext,
  trackDatabaseOperation,
} from '@repo/tooling/observability/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';

const addToCartSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

const updateQuantitySchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0),
});

export async function addToCart(input: {
  productId: string;
  quantity?: number;
}): Promise<{ error?: string; cartItem?: CartItem }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Authentication required' };
    }

    const validated = addToCartSchema.parse(input);
    const { productId, quantity } = validated;

    // Find user and set monitoring context
    const user = await trackDatabaseOperation('find_user', 'user', async () => {
      return database.user.findUnique({
        where: { clerkId: userId },
      });
    });

    if (!user) {
      return { error: 'User not found' };
    }

    // Set user context for error tracking
    setUserContext({
      id: user.id,
      email: user.email || undefined,
      role: user.role as 'BUYER' | 'SELLER' | 'ADMIN',
    });

    // Find product with enhanced monitoring
    const product = await trackDatabaseOperation(
      'find_product',
      'product',
      async () => {
        return database.product.findUnique({
          where: { id: productId },
          include: {
            seller: {
              select: { id: true, firstName: true, lastName: true },
            },
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
        });
      }
    );

    if (!product) {
      return { error: 'Product not found' };
    }

    // Set product context for error tracking
    setProductContext({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      sellerId: product.sellerId,
      categoryId: product.categoryId,
      status: product.status,
    });

    if (product.status !== 'AVAILABLE') {
      return { error: 'Product is no longer available' };
    }

    if (product.sellerId === user.id) {
      return { error: 'Cannot add your own product to cart' };
    }

    const existingCartItem = await database.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await database.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + quantity },
        include: {
          product: {
            include: {
              seller: {
                select: { id: true, firstName: true, lastName: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      });
    } else {
      cartItem = await database.cartItem.create({
        data: {
          userId: user.id,
          productId,
          quantity,
        },
        include: {
          product: {
            include: {
              seller: {
                select: { id: true, firstName: true, lastName: true },
              },
              images: {
                orderBy: { displayOrder: 'asc' },
                take: 1,
              },
            },
          },
        },
      });
    }

    const formattedCartItem: CartItem = {
      id: `cart-${cartItem.id}`,
      productId: cartItem.productId,
      title: cartItem.product.title,
      price: Number(cartItem.product.price),
      imageUrl: cartItem.product.images[0]?.imageUrl || '',
      sellerId: cartItem.product.sellerId,
      sellerName:
        cartItem.product.seller.firstName || cartItem.product.seller.lastName
          ? `${cartItem.product.seller.firstName || ''} ${cartItem.product.seller.lastName || ''}`.trim()
          : undefined,
      condition: cartItem.product.condition,
      size: cartItem.product.size ?? undefined,
      color: cartItem.product.color ?? undefined,
      quantity: cartItem.quantity,
    };

    revalidateTag(`user-cart-${user.id}`);

    return { cartItem: formattedCartItem };
  } catch (error) {
    return { error: parseError(error) };
  }
}

export async function removeFromCart(
  productId: string
): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Authentication required' };
    }

    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    await database.cartItem.delete({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
    });

    revalidateTag(`user-cart-${user.id}`);

    return {};
  } catch (error) {
    return { error: parseError(error) };
  }
}

export async function updateCartQuantity(input: {
  productId: string;
  quantity: number;
}): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Authentication required' };
    }

    const validated = updateQuantitySchema.parse(input);
    const { productId, quantity } = validated;

    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    if (quantity === 0) {
      return removeFromCart(productId);
    }

    await database.cartItem.update({
      where: {
        userId_productId: {
          userId: user.id,
          productId,
        },
      },
      data: { quantity },
    });

    revalidateTag(`user-cart-${user.id}`);

    return {};
  } catch (error) {
    return { error: parseError(error) };
  }
}

export async function clearCart(): Promise<{ error?: string }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { error: 'Authentication required' };
    }

    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    await database.cartItem.deleteMany({
      where: { userId: user.id },
    });

    revalidateTag(`user-cart-${user.id}`);

    return {};
  } catch (error) {
    return { error: parseError(error) };
  }
}

export async function getCartItems(): Promise<{
  error?: string;
  items?: CartItem[];
}> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { items: [] };
    }

    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { items: [] };
    }

    const cartItems = await database.cartItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          include: {
            seller: {
              select: { id: true, firstName: true, lastName: true },
            },
            images: {
              orderBy: { displayOrder: 'asc' },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formattedItems: CartItem[] = cartItems
      .filter((item) => item.product.status === 'AVAILABLE')
      .map((item) => ({
        id: `cart-${item.id}`,
        productId: item.productId,
        title: item.product.title,
        price: Number(item.product.price),
        imageUrl: item.product.images[0]?.imageUrl || '',
        sellerId: item.product.sellerId,
        sellerName:
          item.product.seller.firstName || item.product.seller.lastName
            ? `${item.product.seller.firstName || ''} ${item.product.seller.lastName || ''}`.trim()
            : undefined,
        condition: item.product.condition,
        size: item.product.size ?? undefined,
        color: item.product.color ?? undefined,
        quantity: item.quantity,
      }));

    return { items: formattedItems };
  } catch (error) {
    return { error: parseError(error) };
  }
}

export async function syncCartWithDatabase(
  localItems: CartItem[]
): Promise<{ error?: string; items?: CartItem[] }> {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { items: [] };
    }

    const user = await database.user.findUnique({
      where: { clerkId: userId },
    });

    if (!user) {
      return { items: [] };
    }

    await database.$transaction(async (tx) => {
      await tx.cartItem.deleteMany({
        where: { userId: user.id },
      });

      if (localItems.length > 0) {
        const cartItemsData = localItems.map((item) => ({
          userId: user.id,
          productId: item.productId,
          quantity: item.quantity,
        }));

        await tx.cartItem.createMany({
          data: cartItemsData,
          skipDuplicates: true,
        });
      }
    });

    revalidateTag(`user-cart-${user.id}`);

    return getCartItems();
  } catch (error) {
    return { error: parseError(error) };
  }
}
