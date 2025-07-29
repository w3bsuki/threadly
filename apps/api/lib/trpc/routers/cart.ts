import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure } from '../config';
import { ProductStatus } from '@repo/database';

/**
 * Cart router
 * 
 * Handles shopping cart operations for authenticated users
 */
export const cartRouter = createTRPCRouter({
  /**
   * Get user's cart items
   */
  get: protectedProcedure
    .query(async ({ ctx }) => {
      const { dbUser } = ctx;

      const cartItems = await ctx.database.cartItem.findMany({
        where: { userId: dbUser.id },
        include: {
          product: {
            include: {
              images: {
                select: { url: true },
                take: 1,
              },
              seller: {
                select: { firstName: true, lastName: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      // Calculate totals
      const subtotal = cartItems.reduce((sum, item) => {
        if (item.product.status === ProductStatus.AVAILABLE) {
          return sum + (item.product.price * item.quantity);
        }
        return sum;
      }, 0);

      const unavailableItems = cartItems.filter(
        item => item.product.status !== ProductStatus.AVAILABLE
      );

      return {
        items: cartItems.map(item => ({
          id: item.id,
          quantity: item.quantity,
          product: {
            ...item.product,
            imageUrl: item.product.images[0]?.url || null,
          },
        })),
        subtotal,
        itemCount: cartItems.length,
        unavailableCount: unavailableItems.length,
      };
    }),

  /**
   * Add item to cart
   */
  add: protectedProcedure
    .input(z.object({
      productId: z.string().cuid(),
      quantity: z.number().int().min(1).max(99).default(1),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;

      // Check if product exists and is available
      const product = await ctx.database.product.findUnique({
        where: { id: input.productId },
        select: { 
          id: true, 
          status: true, 
          sellerId: true,
          title: true,
        },
      });

      if (!product) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Product not found',
        });
      }

      if (product.status !== ProductStatus.AVAILABLE) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Product is not available',
        });
      }

      // Prevent sellers from adding their own products
      if (product.sellerId === dbUser.id) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You cannot add your own products to cart',
        });
      }

      try {
        // Check if item already exists in cart
        const existingItem = await ctx.database.cartItem.findUnique({
          where: {
            userId_productId: {
              userId: dbUser.id,
              productId: input.productId,
            },
          },
        });

        if (existingItem) {
          // Update quantity
          const updatedItem = await ctx.database.cartItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + input.quantity },
            include: {
              product: {
                include: {
                  images: { select: { url: true }, take: 1 },
                },
              },
            },
          });

          return {
            ...updatedItem,
            product: {
              ...updatedItem.product,
              imageUrl: updatedItem.product.images[0]?.url || null,
            },
          };
        } else {
          // Create new cart item
          const cartItem = await ctx.database.cartItem.create({
            data: {
              userId: dbUser.id,
              productId: input.productId,
              quantity: input.quantity,
            },
            include: {
              product: {
                include: {
                  images: { select: { url: true }, take: 1 },
                },
              },
            },
          });

          return {
            ...cartItem,
            product: {
              ...cartItem.product,
              imageUrl: cartItem.product.images[0]?.url || null,
            },
          };
        }
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to add item to cart',
        });
      }
    }),

  /**
   * Update cart item quantity
   */
  updateQuantity: protectedProcedure
    .input(z.object({
      itemId: z.string().cuid(),
      quantity: z.number().int().min(1).max(99),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;

      // Check if item belongs to user
      const cartItem = await ctx.database.cartItem.findUnique({
        where: { id: input.itemId },
        select: { userId: true },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cart item not found',
        });
      }

      if (cartItem.userId !== dbUser.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only update your own cart items',
        });
      }

      try {
        const updatedItem = await ctx.database.cartItem.update({
          where: { id: input.itemId },
          data: { quantity: input.quantity },
          include: {
            product: {
              include: {
                images: { select: { url: true }, take: 1 },
              },
            },
          },
        });

        return {
          ...updatedItem,
          product: {
            ...updatedItem.product,
            imageUrl: updatedItem.product.images[0]?.url || null,
          },
        };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update cart item',
        });
      }
    }),

  /**
   * Remove item from cart
   */
  remove: protectedProcedure
    .input(z.object({
      itemId: z.string().cuid(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;

      // Check if item belongs to user
      const cartItem = await ctx.database.cartItem.findUnique({
        where: { id: input.itemId },
        select: { userId: true },
      });

      if (!cartItem) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Cart item not found',
        });
      }

      if (cartItem.userId !== dbUser.id) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'You can only remove your own cart items',
        });
      }

      try {
        await ctx.database.cartItem.delete({
          where: { id: input.itemId },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to remove cart item',
        });
      }
    }),

  /**
   * Clear entire cart
   */
  clear: protectedProcedure
    .mutation(async ({ ctx }) => {
      const { dbUser } = ctx;

      try {
        await ctx.database.cartItem.deleteMany({
          where: { userId: dbUser.id },
        });

        return { success: true };
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to clear cart',
        });
      }
    }),

  /**
   * Get cart item count for header badge
   */
  count: protectedProcedure
    .query(async ({ ctx }) => {
      const { dbUser } = ctx;

      const count = await ctx.database.cartItem.count({
        where: { 
          userId: dbUser.id,
          product: {
            status: ProductStatus.AVAILABLE,
          },
        },
      });

      return { count };
    }),
});