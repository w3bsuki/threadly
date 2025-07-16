# app.md

Seller Dashboard (/apps/app) - Current state and development context.

## CURRENT FEATURES
- **Dashboard**: Real-time metrics, mobile-responsive stats
- **Inventory**: Product management with bulk operations
- **Orders**: Tracking and fulfillment
- **Analytics**: Comprehensive metrics and insights
- **Reviews**: Mobile-first with photos and voting
- **Financial**: P&L, tax reports, expense tracking
- **Marketing**: Discounts, featured listings, ROI tracking

## CRITICAL FIXES NEEDED

### 1. Mobile Navigation (HIGH)
- **Issue**: Two conflicting navigation systems
- **Files**: `mobile-bottom-nav.tsx` and `app-layout.tsx`
- **Fix**: Consolidate to single system with 44px touch targets

### 2. Responsive Layout (HIGH)
- **Issue**: Stats cards cutoff, poor mobile grids
- **Fix**: Remove max-height constraints, progressive grids

### 3. TypeScript Errors (HIGH)
- **Issue**: 'any' types in tests, missing exports
- **Fix**: Add proper types, fix @repo/testing module

## UI/UX IMPROVEMENTS

### Next Priority
1. **Product Wizard**: Multi-step form for easier listing
2. **Customer Analytics**: Demographics, CLV, retention
3. **Mobile UX**: Touch gestures, haptic feedback

### Design Principles
- Mobile-first approach
- 44px minimum touch targets
- Progressive disclosure
- Optimistic updates
- Clear error states

## DEVELOPMENT NOTES
- Server Components by default
- Include DB relations upfront
- Use cache.remember() for Redis
- Run pnpm typecheck after changes
- Follow existing patterns in codebase

## SUCCESS METRICS
- Mobile conversion: +25%
- Seller retention: +40%
- Listing time: -60%
- Revenue per seller: +35%