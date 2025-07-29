import { TRPCError, initTRPC } from '@trpc/server';
import { NextRequest } from 'next/server';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { log, logError } from '@repo/observability/server';
import type { User } from '@clerk/nextjs/server';
import superjson from 'superjson';
import { ZodError } from 'zod';

// Context interface
interface CreateContextOptions {
  req: NextRequest;
  user: User | null;
  dbUser: any | null;
}

// Create context for tRPC requests
export async function createTRPCContext(opts: { req: NextRequest }) {
  const { req } = opts;
  
  // Get authenticated user
  const user = await currentUser();
  
  // Get database user if authenticated
  let dbUser = null;
  if (user) {
    try {
      dbUser = await database.user.findUnique({
        where: { clerkId: user.id },
        select: { 
          id: true, 
          role: true, 
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true
        }
      });
      
      // Auto-create database user if doesn't exist
      if (!dbUser) {
        dbUser = await database.user.create({
          data: {
            clerkId: user.id,
            email: user.emailAddresses[0]?.emailAddress || '',
            firstName: user.firstName || null,
            lastName: user.lastName || null,
          },
          select: { 
            id: true, 
            role: true, 
            clerkId: true,
            email: true,
            firstName: true,
            lastName: true
          }
        });
        
        log('Auto-created database user', { userId: user.id, dbUserId: dbUser.id });
      }
    } catch (error) {
      logError('Failed to fetch/create database user', error);
    }
  }

  return {
    req,
    user,
    dbUser,
    database,
  };
}

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// Initialize tRPC
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === 'BAD_REQUEST' && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  },
});

// Base router and procedure builders
export const createTRPCRouter = t.router;

// Public procedure (no authentication required)
export const publicProcedure = t.procedure;

// Authenticated procedure (requires valid user)
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user || !ctx.dbUser) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user,
      dbUser: ctx.dbUser,
    },
  });
});

// Admin procedure (requires admin role)
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.dbUser.role !== 'ADMIN') {
    throw new TRPCError({ code: 'FORBIDDEN' });
  }
  
  return next({ ctx });
});

// Logging middleware for all procedures
export const loggedProcedure = publicProcedure.use(async ({ path, type, next }) => {
  const start = Date.now();
  
  const result = await next();
  
  const durationMs = Date.now() - start;
  
  if (result.ok) {
    log('tRPC procedure success', { 
      path, 
      type, 
      durationMs 
    });
  } else {
    logError('tRPC procedure error', result.error, {
      path,
      type,
      durationMs
    });
  }
  
  return result;
});

// Rate limited procedure (for public endpoints)
export const rateLimitedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  // Import rate limiting
  const { checkRateLimit, generalApiLimit } = await import('@repo/security');
  
  const rateLimitResult = await checkRateLimit(generalApiLimit, ctx.req);
  if (!rateLimitResult.allowed) {
    throw new TRPCError({ 
      code: 'TOO_MANY_REQUESTS',
      message: rateLimitResult.error?.message || 'Rate limit exceeded'
    });
  }
  
  return next();
});