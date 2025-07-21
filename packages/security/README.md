# @repo/security

This package provides security middleware and rate limiting for the Threadly marketplace application using Arcjet.

## Rate Limiting

The package exports pre-configured rate limiters for different types of API endpoints:

### Available Rate Limiters

- **`generalApiLimit`** - 100 requests per minute (for general API endpoints)
- **`authRateLimit`** - 10 requests per minute (for authentication endpoints)
- **`paymentRateLimit`** - 20 requests per minute (for payment processing)
- **`uploadRateLimit`** - 10 requests per minute (for file uploads)
- **`messageRateLimit`** - 30 requests per minute (for messaging)

### Usage

```typescript
import { generalApiLimit, checkRateLimit } from '@repo/security';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Check rate limit
  const rateLimitResult = await checkRateLimit(generalApiLimit, request);
  
  if (!rateLimitResult.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: rateLimitResult.error?.message || 'Rate limit exceeded',
      },
      { 
        status: 429,
        headers: rateLimitResult.headers, // Includes proper rate limit headers
      }
    );
  }

  // Continue with your API logic
  return NextResponse.json({ data: 'success' });
}
```

### Rate Limit Headers

When a rate limit is exceeded, the response includes standard rate limiting headers:

- `X-RateLimit-Limit` - The maximum number of requests allowed
- `X-RateLimit-Remaining` - The number of requests remaining in the current window
- `X-RateLimit-Reset` - The time when the rate limit window resets (Unix timestamp)
- `Retry-After` - The number of seconds to wait before retrying

### Configuration

Rate limits require an Arcjet API key to be configured in the environment:

```env
ARCJET_KEY=ajkey_your_key_here
```

If no key is configured, rate limiting will be bypassed with a warning logged to the console.

## Bot Protection

The package also provides bot protection through the `secure` function:

```typescript
import { secure } from '@repo/security';

// Allow specific bots while blocking others
await secure(['GOOGLE_CRAWLER', 'BING_CRAWLER']);
```

## Environment Variables

- `ARCJET_KEY` - Your Arcjet API key (required for rate limiting to work)