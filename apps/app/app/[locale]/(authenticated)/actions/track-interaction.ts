'use server';

import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import type { InteractionType } from '@repo/database';

interface TrackInteractionInput {
  productId: string;
  type: InteractionType;
  duration?: number;
  metadata?: Record<string, any>;
}

export async function trackInteraction(input: TrackInteractionInput) {
  try {
    const user = await currentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id }
    });

    if (!dbUser) {
      return { success: false, error: 'User not found' };
    }

    // Calculate score based on interaction type
    const scoreMap: Record<InteractionType, number> = {
      PURCHASE: 5.0,
      CART_ADD: 3.0,
      FAVORITE: 2.5,
      REVIEW: 2.0,
      SHARE: 1.5,
      VIEW: 1.0,
      SEARCH_CLICK: 0.8,
    };

    const score = scoreMap[input.type] || 1.0;

    // Upsert interaction
    await database.userInteraction.upsert({
      where: {
        userId_productId_type: {
          userId: dbUser.id,
          productId: input.productId,
          type: input.type,
        },
      },
      update: {
        score: {
          increment: 0.1, // Increase score for repeated interactions
        },
        duration: input.duration,
        metadata: input.metadata,
      },
      create: {
        userId: dbUser.id,
        productId: input.productId,
        type: input.type,
        score,
        duration: input.duration,
        metadata: input.metadata,
      },
    });

    // Update product analytics if it's a view
    if (input.type === 'VIEW') {
      await database.productAnalytics.update({
        where: { productId: input.productId },
        data: {
          viewsToday: { increment: 1 },
          viewsWeek: { increment: 1 },
          viewsMonth: { increment: 1 },
          lastViewedAt: new Date(),
        },
      });

      await database.product.update({
        where: { id: input.productId },
        data: {
          views: { increment: 1 },
        },
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to track interaction:', error);
    return { success: false, error: 'Failed to track interaction' };
  }
}