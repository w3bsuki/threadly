# @repo/api-utils

Standardized error handling, response formatting, and API utilities for the Threadly platform.

## Features

- **Consistent Error Handling**: Standardized error codes, status mappings, and response formats
- **Response Utilities**: Type-safe success and error response helpers
- **Input Validation**: Zod-based validation with comprehensive error handling
- **API Middleware**: Rate limiting, authentication, and request logging
- **Type Safety**: Full TypeScript support with proper type inference

## Usage

### Basic API Route with Error Handling

```typescript
import { createGetHandler, createSuccessResponse, validateSearchParams, PaginationSchema } from '@repo/api-utils';

export const GET = createGetHandler(async (request, context) => {
  // Validate input
  const params = await validateSearchParams(PaginationSchema, request, context);
  
  // Your business logic
  const data = await fetchData(params);
  
  // Return standardized response
  return createSuccessResponse(data);
}, {
  rateLimitConfig: { requests: 100, window: 60 },
  requireAuth: true,
  logRequests: true,
});
```

### Error Handling

```typescript
import { createApiError, ErrorCode, createErrorResponse } from '@repo/api-utils';

// Create custom errors
const error = createApiError(
  ErrorCode.NOT_FOUND,
  'Product not found',
  { productId: '123' }
);

// Handle errors in routes
try {
  // Your logic
} catch (error) {
  return createErrorResponse(error);
}
```

### Response Formatting

```typescript
import { createSuccessResponse, createPaginationMeta } from '@repo/api-utils';

// Success response with pagination
return createSuccessResponse(products, {
  pagination: createPaginationMeta(page, limit, total),
  meta: { filters: appliedFilters }
});
```

## Error Codes

- **Validation**: `INVALID_INPUT`, `VALIDATION_FAILED`, `MISSING_REQUIRED_FIELD`
- **Auth**: `UNAUTHORIZED`, `FORBIDDEN`, `INVALID_TOKEN`, `TOKEN_EXPIRED`
- **Resources**: `NOT_FOUND`, `ALREADY_EXISTS`, `CONFLICT`
- **Rate Limiting**: `RATE_LIMIT_EXCEEDED`
- **Server**: `INTERNAL_ERROR`, `DATABASE_ERROR`, `EXTERNAL_SERVICE_ERROR`

## Response Format

All API responses follow this consistent format:

### Success Response
```typescript
{
  success: true,
  data: T,
  pagination?: PaginationMeta,
  meta?: Record<string, unknown>
}
```

### Error Response
```typescript
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown,
    context?: Record<string, unknown>
  }
}
```