import { z } from 'zod';
import { createTRPCRouter, rateLimitedProcedure } from '../config';

/**
 * Categories router
 * 
 * Handles product categories
 */
export const categoriesRouter = createTRPCRouter({
  /**
   * Get all categories
   */
  list: rateLimitedProcedure
    .query(async ({ ctx }) => {
      const categories = await ctx.database.category.findMany({
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: { Product: true },
          },
        },
      });

      return {
        categories: categories.map(category => ({
          ...category,
          productCount: category._count.Product,
        })),
      };
    }),

  /**
   * Get category by ID with products
   */
  byId: rateLimitedProcedure
    .input(z.object({ id: z.string().cuid() }))
    .query(async ({ ctx, input }) => {
      const category = await ctx.database.category.findUnique({
        where: { id: input.id },
        include: {
          _count: {
            select: { Product: true },
          },
        },
      });

      if (!category) {
        return null;
      }

      return {
        ...category,
        productCount: category._count.Product,
      };
    }),
});