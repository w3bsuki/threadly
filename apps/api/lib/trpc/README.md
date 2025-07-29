# tRPC Infrastructure

This directory contains the complete tRPC server infrastructure for the Threadly API.

## Architecture

### Core Components

- **`config.ts`** - Main tRPC configuration, context creation, and procedure builders
- **`routers/_app.ts`** - Main application router that combines all sub-routers
- **`types.ts`** - Type exports for client consumption
- **`index.ts`** - Main export file for server-side usage

### Router Structure

Each router handles a specific domain:

- **`auth.ts`** - Authentication and user profile management
- **`products.ts`** - Product CRUD operations with filtering and search
- **`cart.ts`** - Shopping cart functionality 
- **`orders.ts`** - Order management (stub - to be implemented)
- **`messages.ts`** - User messaging (stub - to be implemented)
- **`users.ts`** - User profiles and social features (stub - to be implemented)
- **`categories.ts`** - Product categories
- **`reviews.ts`** - Product reviews (stub - to be implemented)
- **`favorites.ts`** - User favorites (stub - to be implemented)  
- **`search.ts`** - Search functionality (stub - to be implemented)
- **`health.ts`** - System health monitoring

## Security Features

### Authentication
- **Public procedures** - No authentication required
- **Protected procedures** - Requires valid Clerk user + database user
- **Admin procedures** - Requires admin role
- **Rate limited procedures** - Public endpoints with rate limiting

### Input Validation
- All inputs validated with Zod schemas
- Type-safe request/response handling
- Automatic error formatting

### Error Handling
- Structured error responses
- Comprehensive logging with observability package
- Proper HTTP status codes

## Usage

### Server Side
```typescript
import { appRouter, createTRPCContext } from './lib/trpc';
```

### Client Side
```typescript
import type { AppRouter } from 'api';
```

## API Endpoint

The tRPC API is available at `/api/trpc/[trpc]` and handles both GET and POST requests.

## Development

### Adding New Procedures

1. Add procedures to appropriate router file
2. Import and use proper procedure type:
   - `publicProcedure` - No auth required
   - `protectedProcedure` - Auth required
   - `adminProcedure` - Admin role required
   - `rateLimitedProcedure` - Rate limited public

3. Use Zod for input validation
4. Include proper error handling

### Adding New Routers

1. Create router file in `routers/` directory
2. Export router from `routers/_app.ts`
3. Add to main router in `_app.ts`

## Integration

### With Existing REST Endpoints
tRPC runs alongside existing REST endpoints. Both approaches can be used simultaneously.

### With Authentication
Integrates with Clerk authentication and auto-creates database users as needed.

### With Security
Uses existing rate limiting and security middleware from `@repo/security`.

### With Database
Uses Prisma client from `@repo/database` with proper connection handling.

## Next Phase

Stub routers marked with "Implementation will be added in next phase" contain:
- Input/output type definitions
- Basic structure
- Placeholder implementations

These will be fully implemented in the endpoint migration phase.