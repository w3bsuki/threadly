// Export Prisma client and types
export { PrismaClient, Prisma, ProductStatus } from '../generated/client'
export type { 
  User, Product, ProductImage, Order, Category, Review, Message, Conversation,
  Address, CartItem, Favorite, Notification, SellerProfile
} from '../generated/client'

// Export database utilities
export * from './lib/prisma'
export * from './lib/query-utils'
export * from './lib/monitoring'
export * from './lib/backup-strategy'

// Re-export the main database instance
export { prisma as database } from './lib/prisma'