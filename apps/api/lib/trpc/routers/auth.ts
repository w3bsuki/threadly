import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../config';

/**
 * Authentication router
 * 
 * Handles user authentication state and profile management
 */
export const authRouter = createTRPCRouter({
  /**
   * Get current user session and profile
   */
  me: protectedProcedure
    .query(async ({ ctx }) => {
      const { user, dbUser } = ctx;
      
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        profile: {
          id: dbUser.id,
          role: dbUser.role,
          email: dbUser.email,
          firstName: dbUser.firstName,
          lastName: dbUser.lastName,
        }
      };
    }),

  /**
   * Update user profile information
   */
  updateProfile: protectedProcedure
    .input(z.object({
      firstName: z.string().min(1).max(50).optional(),
      lastName: z.string().min(1).max(50).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { dbUser } = ctx;
      
      try {
        const updatedUser = await ctx.database.user.update({
          where: { id: dbUser.id },
          data: {
            firstName: input.firstName ?? dbUser.firstName,
            lastName: input.lastName ?? dbUser.lastName,
          },
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            role: true,
          }
        });
        
        return updatedUser;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to update profile',
        });
      }
    }),

  /**
   * Check if user exists in database
   * Used for onboarding flow
   */
  checkUser: publicProcedure
    .input(z.object({
      clerkId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const user = await ctx.database.user.findUnique({
        where: { clerkId: input.clerkId },
        select: { id: true, role: true }
      });
      
      return {
        exists: !!user,
        user: user ? { id: user.id, role: user.role } : null,
      };
    }),

  /**
   * Create user in database (webhook handler helper)
   */
  createUser: publicProcedure
    .input(z.object({
      clerkId: z.string(),
      email: z.string().email(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const user = await ctx.database.user.create({
          data: {
            clerkId: input.clerkId,
            email: input.email,
            firstName: input.firstName,
            lastName: input.lastName,
          },
          select: {
            id: true,
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
          }
        });
        
        return user;
      } catch (error) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create user',
        });
      }
    }),
});