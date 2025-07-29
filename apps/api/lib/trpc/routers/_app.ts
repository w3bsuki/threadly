import { createTRPCRouter } from '../config';
import { authRouter } from './auth';
import { productsRouter } from './products';
import { ordersRouter } from './orders';
import { cartRouter } from './cart';
import { messagesRouter } from './messages';
import { usersRouter } from './users';
import { categoriesRouter } from './categories';
import { reviewsRouter } from './reviews';
import { favoritesRouter } from './favorites';
import { searchRouter } from './search';
import { healthRouter } from './health';

/**
 * Main tRPC application router
 * 
 * This is the primary router for the tRPC API. All sub-routers are merged here.
 * Each router corresponds to a major feature area of the application.
 */
export const appRouter = createTRPCRouter({
  // Core functionality
  auth: authRouter,
  products: productsRouter,
  orders: ordersRouter,
  cart: cartRouter,
  
  // Communication
  messages: messagesRouter,
  users: usersRouter,
  
  // Content and discovery
  categories: categoriesRouter,
  reviews: reviewsRouter,
  favorites: favoritesRouter,
  search: searchRouter,
  
  // System
  health: healthRouter,
});

// Export type definition of API for client-side usage
export type AppRouter = typeof appRouter;