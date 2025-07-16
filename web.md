# web.md

Customer Marketplace (/apps/web) - Current state and development context.

## CURRENT FEATURES
- **Marketplace**: Product listings, search (Algolia), filters
- **Commerce**: Cart, checkout (Stripe), quick-view
- **Mobile**: 44px touch targets, swipe gestures, bottom nav
- **Performance**: PWA, service worker, loading skeletons
- **Auth**: Clerk integration with session management

## CRITICAL FIXES NEEDED

### 1. Favorites System (HIGH)
- **Issue**: Page shows placeholder text only
- **File**: `/app/[locale]/favorites/page.tsx`
- **Fix**: Implement collections, price alerts, sharing

### 2. Product Reviews (HIGH)
- **Issue**: Hardcoded 4.8 rating
- **Fix**: Dynamic ratings with photos and voting

### 3. Recommendations (MEDIUM)
- **Issue**: No frontend implementation
- **Fix**: Recently viewed, personalized, trending sections

## UI/UX IMPROVEMENTS

### Phase 1: Quick Wins (1-2 weeks)
- Social proof indicators (views, purchases, stock)
- Seller verification badges
- Pull-to-refresh, haptic feedback
- Offline mode indicators

### Phase 2: Core Features (3-4 weeks)
- Complete reviews with photos
- Recommendations engine UI
- Size guides and fit feedback
- Price drop notifications

### Phase 3: Advanced (4-6 weeks)
- Visual search (camera)
- Bundle suggestions
- Abandoned cart recovery
- Filter presets

## DEVELOPMENT NOTES
- Server Components by default
- Use @repo/design-system patterns
- Include DB relations upfront
- cache.remember() for Redis
- Zod validation required

## PERFORMANCE TARGETS
- <2s load on 3G
- Core Web Vitals green
- 60fps animations
- <100KB initial JS

## SUCCESS METRICS
- Conversion rate: +15-25%
- Wishlist engagement: +30-40%
- Mobile bounce rate: -20%
- Average order value: +15%