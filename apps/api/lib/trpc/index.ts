/**
 * tRPC Server Exports
 * 
 * Main export file for tRPC server functionality
 */

// Export the main router and types
export { appRouter } from './routers/_app';
export { createTRPCContext } from './config';
export type { AppRouter, Context } from './types';

// Export individual routers for server-side usage
export { authRouter } from './routers/auth';
export { productsRouter } from './routers/products';
export { cartRouter } from './routers/cart';
export { ordersRouter } from './routers/orders';
export { messagesRouter } from './routers/messages';
export { usersRouter } from './routers/users';
export { categoriesRouter } from './routers/categories';
export { reviewsRouter } from './routers/reviews';
export { favoritesRouter } from './routers/favorites';
export { searchRouter } from './routers/search';
export { healthRouter } from './routers/health';

// Export procedure builders for extending routers
export {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
  adminProcedure,
  loggedProcedure,
  rateLimitedProcedure,
} from './config';