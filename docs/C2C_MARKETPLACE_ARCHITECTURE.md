# Threadly C2C Marketplace Architecture

## Overview

Threadly is a fully functional C2C (Consumer-to-Consumer) fashion marketplace where users can both sell and buy products. The platform is built with a modern architecture using Next.js 15, TypeScript, and a shared PostgreSQL database.

## System Architecture

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Clerk Auth    │         │  Neon Database  │         │   Uploadthing   │
│  (User Mgmt)    │◀────────│   PostgreSQL    │────────▶│ (Image Storage) │
└────────┬────────┘         └────────┬────────┘         └─────────────────┘
         │                           │
         │                           │
    ┌────▼────────┐         ┌────────▼────────┐
    │  /apps/app  │         │   /apps/web     │
    │ (Port 3000) │         │  (Port 3001)    │
    │   SELLERS   │         │    BUYERS       │
    └─────────────┘         └─────────────────┘
```

## User Journey

### 1. New User Registration
```
User visits site → Clicks "Sign Up" → Clerk handles registration
                                    ↓
                        User record auto-created in database
                                    ↓
                        User can now sell AND buy products
```

### 2. Selling Products
```
Seller logs in → Goes to /selling/new → Fills product form:
  - Title & Description
  - Price
  - Category (dropdown)
  - Condition (NEW_WITH_TAGS, VERY_GOOD, etc.)
  - Brand, Size, Color (optional)
  - Upload 1-5 images
                    ↓
        Product saved to database with status: AVAILABLE
                    ↓
        Instantly visible on marketplace (/web)
```

### 3. Buying Products
```
Buyer visits /web → Browses products → Can filter by:
  - Category (Women's, Men's, etc.)
  - Price range
  - Condition
  - Sort by: Newest, Price, Popularity
                    ↓
        Clicks product → Views details → Can purchase
```

## Data Flow

### Product Creation Flow
1. **User uploads product in /app**
   - Form validation with Zod
   - Input sanitization for security
   - Image upload to Uploadthing
   
2. **Server action saves to database**
   ```typescript
   // /apps/app/.../actions/create-product.ts
   const product = await database.product.create({
     data: {
       title, description, price,
       categoryId, condition,
       status: 'AVAILABLE', // Key: makes it visible
       sellerId: dbUser.id,
       images: { create: [...] }
     }
   });
   ```

3. **Product immediately available in /web**
   ```typescript
   // /apps/web/.../products-content.tsx
   const products = await database.product.findMany({
     where: { status: 'AVAILABLE' }, // Only shows available
     include: { images, seller, category }
   });
   ```

## Category System

### How Categories Work Automatically

1. **Database Structure**
   ```prisma
   model Category {
     id       String  @id
     name     String  // e.g., "Dresses"
     slug     String  // e.g., "dresses"
     parentId String? // For subcategories
     parent   Category?
     children Category[]
   }
   ```

2. **Product Assignment**
   - Seller selects category from dropdown
   - Product gets `categoryId` field
   - No manual categorization needed

3. **Automatic Filtering**
   ```typescript
   // When user selects "Women's Clothing"
   where: {
     category: {
       name: { contains: "Women", mode: 'insensitive' }
     }
   }
   ```

## Key Features

### Real-time Updates
- No caching delays
- Products appear instantly after creation
- Database is single source of truth

### Automatic Features
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Condition filtering
- ✅ Search by title/brand/description
- ✅ Sort by newest/price/popularity
- ✅ Pagination
- ✅ Responsive design

### Security
- Clerk authentication required
- Input validation with Zod
- XSS protection via sanitization
- SQL injection prevention via Prisma
- Rate limiting on APIs

## Environment Variables

Both apps share the same database:
```env
DATABASE_URL="postgresql://...@neon.tech/threadly"
```

This ensures data consistency across the platform.

## Production Deployment

When deployed on Vercel:
1. Set all environment variables
2. Database migrations run automatically
3. Both apps deploy to separate URLs
4. Shared database ensures consistency
5. Users can immediately start buying/selling

## Why This Architecture?

### Pros:
- **Separation of Concerns**: Sellers and buyers have different UIs
- **Scalability**: Can scale apps independently
- **Security**: Seller features isolated from public marketplace
- **Performance**: Optimized for each use case
- **Maintainability**: Clear boundaries between apps

### Standard Practice:
This is a common pattern used by major marketplaces:
- eBay (separate seller center)
- Etsy (seller dashboard vs marketplace)
- Depop (seller tools vs buyer experience)

## Summary

The Threadly platform is production-ready for C2C commerce. New users can register, upload products with proper categorization, and those products immediately appear in the marketplace with automatic filtering and search capabilities. This is a proper, scalable architecture for a modern marketplace.