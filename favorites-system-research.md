# Favorites/Wishlist System Research Report

## Executive Summary

The favorites/wishlist system in the Threadly C2C fashion marketplace is **partially implemented** with a solid foundation. The database schema, API endpoints, and client-side hooks exist, but several components need enhancement to provide a complete user experience with price alerts and advanced functionality.

## Current Implementation State

### ✅ What Exists and Works

#### 1. Database Schema (`/packages/database/prisma/schema.prisma`)
- **Favorite Model** (lines 90-101):
  ```prisma
  model Favorite {
    id        String   @id @default(cuid())
    userId    String
    productId String
    createdAt DateTime @default(now())
    product   Product  @relation("favorites", fields: [productId], references: [id], onDelete: Cascade)
    User      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

    @@unique([userId, productId])
    @@index([productId])
    @@index([userId])
  }
  ```
- **Proper relationships** with Product and User models
- **Unique constraint** prevents duplicate favorites
- **Proper indexing** for performance
- **Cascade deletion** for data integrity

#### 2. API Endpoints (Both Web and API apps)

**Web App API (`/apps/web/app/api/favorites/`)**:
- `/api/favorites/toggle/route.ts` - Toggle favorite status with optimistic updates
- Basic authentication with Clerk
- Zod validation

**API App (`/apps/api/app/api/favorites/`)**:
- `GET /api/favorites` - Fetch user's favorites with pagination and full product details
- `POST /api/favorites` - Add to favorites 
- `DELETE /api/favorites` - Remove from favorites
- `/api/favorites/check/route.ts` - Batch check favorite status for multiple products
- `/api/favorites/toggle/route.ts` - Toggle favorite with complete product data
- **Rate limiting**, **proper error handling**, **comprehensive logging**

#### 3. Client-Side Implementation

**React Hook (`/apps/web/lib/hooks/use-favorites.ts`)**:
- `toggleFavorite()` - With optimistic updates
- `checkFavorite()` - Check individual product status
- `isFavorited()` - Local state checking
- `isPending` - Loading state management
- **Proper error handling** and rollback on failures

**Product Integration**:
- **Product Cards** (`/apps/web/components/product-grid-client.tsx`, lines 91-99, 146-155):
  - Heart button with visual feedback
  - Optimistic updates
  - Proper accessibility (aria-label, aria-pressed)
  - Error handling with toast notifications
  
- **Product Detail Page** (`/apps/web/app/[locale]/product/[id]/components/product-detail.tsx`):
  - Heart button in both desktop and mobile layouts
  - Analytics tracking for favorites
  - Visual state feedback
  - Proper integration with authentication

#### 4. Favorites Management Pages

**Seller Dashboard** (`/apps/app/app/[locale]/(authenticated)/buying/favorites/page.tsx`):
- **Complete favorites listing** with product details
- **Visual product cards** with images, pricing, seller info
- **Status badges** (Available/Sold)
- **Action buttons** (View, Add to Cart)
- **Empty state** with call-to-action
- **Quick actions section** with placeholders for price alerts

**Web App** (`/apps/web/app/[locale]/favorites/page.tsx`):
- **Basic placeholder page** - Currently shows "Sign in to see your favorite items"
- **Needs major enhancement**

#### 5. Authentication & User Management
- **Clerk authentication** properly integrated
- **User session management** working across both apps
- **Database user lookups** functioning correctly

### ❌ What's Missing or Needs Enhancement

#### 1. Price Alert System (HIGH PRIORITY)
- **No database schema** for price alerts
- **No API endpoints** for managing alerts
- **No background jobs** for price monitoring
- **No notification system** for price changes
- **Placeholder UI** exists but no functionality

#### 2. Enhanced Web App Favorites Page
The current web favorites page (`/apps/web/app/[locale]/favorites/page.tsx`) is a **basic placeholder**:
- No actual favorites display
- No authentication integration
- No product grid or management features
- **Needs complete implementation** similar to the app version

#### 3. Advanced Features
- **Share favorites list** - UI exists but no backend
- **Similar items suggestions** - Basic placeholder
- **Bulk favorites management** (select all, bulk remove)
- **Favorites organization** (categories, tags, collections)
- **Recently removed items** (undo functionality)

#### 4. Analytics & Insights
- Basic analytics tracking exists but needs enhancement:
  - **Favorites conversion rate** (favorite → purchase)
  - **Popular favorites trends**
  - **User favorites behavior patterns**

#### 5. Cross-Platform Sync Issues
- **Inconsistent API usage** between web and app
- **Different response formats** in some endpoints
- **State management** not synchronized

## User Flow Analysis

### Current User Experience

1. **Discovery & Favoriting**:
   - ✅ User browses products on homepage/search
   - ✅ Clicks heart icon on product cards
   - ✅ Optimistic UI updates immediately
   - ✅ Heart fills/empties with visual feedback
   - ✅ Works on both product cards and detail pages

2. **Favorites Management**:
   - ✅ **Seller Dashboard**: Complete experience with grid view, actions
   - ❌ **Web App**: Broken experience, just placeholder text
   - ✅ Product status indicators (Available/Sold)
   - ✅ Quick access to view/purchase favorited items

3. **Notifications & Alerts**:
   - ❌ **No price alert functionality**
   - ❌ **No back-in-stock notifications**
   - ❌ **No similar items alerts**

### Pages Where Favorites Integration Exists

1. **Homepage** (`/apps/web/app/[locale]/(home)/page.tsx`)
   - Product grid with heart buttons ✅

2. **Product Listing** (`/apps/web/app/[locale]/products/page.tsx`)
   - Product grid with heart buttons ✅

3. **Product Detail** (`/apps/web/app/[locale]/product/[id]/page.tsx`)
   - Heart button, favorites count, analytics ✅

4. **Search Results** (`/apps/web/app/[locale]/search/page.tsx`)
   - Product grid with heart buttons ✅

5. **Seller Dashboard - Favorites** (`/apps/app/app/[locale]/(authenticated)/buying/favorites/page.tsx`)
   - Complete favorites management ✅

6. **Web App - Favorites** (`/apps/web/app/[locale]/favorites/page.tsx`)
   - Placeholder only ❌

## Technical Architecture Assessment

### Strengths
- **Solid database foundation** with proper relationships and constraints
- **Comprehensive API layer** with rate limiting and error handling
- **React hooks** with optimistic updates and proper state management
- **Authentication integration** working correctly
- **Performance optimizations** with proper indexing and caching considerations

### Weaknesses
- **Inconsistent implementation** between web and app platforms
- **Missing price alert infrastructure**
- **No background job system** for automated features
- **Limited analytics** and user insights

## Implementation Gaps Priority

### HIGH PRIORITY (30% engagement impact potential)
1. **Complete Web App favorites page implementation**
2. **Price alerts system** (database schema + API + background jobs)
3. **Cross-platform API consistency**

### MEDIUM PRIORITY
1. **Enhanced favorites management** (bulk operations, organization)
2. **Advanced analytics** and user insights
3. **Similar items recommendations**

### LOW PRIORITY
1. **Social features** (share lists, public favorites)
2. **Advanced filtering** within favorites
3. **Export functionality**

## Recommended Next Steps

1. **Immediate**: Implement complete web app favorites page matching the seller dashboard functionality
2. **Phase 1**: Build price alerts system with database schema and API endpoints
3. **Phase 2**: Add background job system for price monitoring and notifications
4. **Phase 3**: Enhance with advanced features and analytics

## File Structure Summary

### Core Implementation Files
- **Database**: `/packages/database/prisma/schema.prisma` (Favorite model)
- **API Endpoints**: `/apps/api/app/api/favorites/` (Complete CRUD)
- **Web API**: `/apps/web/app/api/favorites/` (Basic toggle)
- **React Hook**: `/apps/web/lib/hooks/use-favorites.ts`
- **Product Integration**: `/apps/web/components/product-grid-client.tsx`
- **Detail Page**: `/apps/web/app/[locale]/product/[id]/components/product-detail.tsx`
- **Seller Dashboard**: `/apps/app/app/[locale]/(authenticated)/buying/favorites/page.tsx` ✅
- **Web Favorites**: `/apps/web/app/[locale]/favorites/page.tsx` ❌ (Needs work)

### Authentication
- **Clerk integration**: `/packages/auth/server.ts`
- **Session management**: Working across all components

The favorites system has a **strong foundation** but needs **focused implementation** to unlock its 30% engagement potential, primarily through completing the web app experience and adding price alert functionality.