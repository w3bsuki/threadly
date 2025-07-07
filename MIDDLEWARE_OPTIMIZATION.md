# Middleware Bundle Size Optimization

## Problem
The middleware bundle was exceeding Next.js's 1MB limit due to heavy dependencies being imported.

## Solution
Created lightweight exports specifically for middleware usage to avoid importing heavy dependencies.

### Changes Made

1. **Observability Package**
   - Created `middleware-error.ts` with a lightweight `parseError` function
   - Avoided importing `@sentry/nextjs` in middleware (which was bringing in the entire Sentry SDK)
   - The full observability features remain available for API routes and server components

2. **Security Package**
   - Created `middleware-exports.ts` with only the `secure` function needed for middleware
   - Avoided importing the full `index.ts` which includes rate limiting functions and CSRF utilities
   - These features remain available for API routes through the main export

### Results
- **Before**: Middleware bundle > 1MB (build failed)
- **After**: Middleware bundle = 228KB (build successful)

### Key Insights
The main culprits were:
- `@sentry/nextjs` - Full error tracking SDK with many features
- Rate limiting utilities with multiple Arcjet configurations
- CSRF protection utilities

### Pattern for Future Development
When adding functionality to middleware:
1. Create separate lightweight exports for middleware-specific functions
2. Avoid importing heavy SDKs or libraries
3. Keep middleware focused on routing, authentication, and security headers
4. Move heavy operations to API routes or server components

### Files Created
- `/packages/observability/middleware-error.ts` - Lightweight error parser
- `/packages/security/middleware-exports.ts` - Minimal security functions

### Files Modified
- `/apps/web/middleware.ts` - Updated imports to use lightweight versions
- `/packages/observability/package.json` - Added middleware-error export
- `/packages/security/package.json` - Added middleware-exports export