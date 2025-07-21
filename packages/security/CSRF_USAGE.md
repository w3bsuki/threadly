# CSRF Protection Usage Guide

This guide explains how to use the CSRF protection implementation in Threadly.

## Overview

The CSRF protection uses the Double Submit Cookie pattern, where:
1. A random token is generated and stored in an httpOnly cookie
2. The same token must be sent in a custom header with state-changing requests
3. The server validates that both tokens match

## Server-Side Setup

### Middleware Configuration

CSRF protection is automatically applied through middleware:

```typescript
// apps/app/middleware.ts or apps/api/middleware.ts
import { csrfMiddleware } from '@repo/security';

// CSRF is automatically checked for all API routes
// Exempt paths: /api/webhooks, /api/health, /api/uploadthing, /api/collaboration/auth
```

### Initializing CSRF Protection

For authenticated users, CSRF tokens are automatically initialized in the layout:

```typescript
// apps/app/app/(authenticated)/layout.tsx
import { initializeCSRFProtection } from '@repo/security';

const AppLayout = async ({ children }) => {
  // ... authentication checks ...
  
  // Initialize CSRF protection for authenticated users
  await initializeCSRFProtection();
  
  // ... rest of layout ...
};
```

## Client-Side Usage

### Using the useCSRF Hook

The recommended way to make CSRF-protected API calls:

```typescript
import { useCSRF } from '@/lib/hooks/use-csrf';

function MyComponent() {
  const { fetchWithCSRF, getCSRFHeaders } = useCSRF();

  // Option 1: Use fetchWithCSRF wrapper
  const handleApiCall = async () => {
    const response = await fetchWithCSRF('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  // Option 2: Use getCSRFHeaders manually
  const handleManualCall = async () => {
    const response = await fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: getCSRFHeaders({
        'Content-Type': 'application/json',
      }),
    });
  };
}
```

### With Form Submissions

```typescript
const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  
  const response = await fetchWithCSRF('/api/products', {
    method: 'POST',
    body: formData,
  });
};
```

### With API Client Libraries

You can wrap existing API clients with CSRF protection:

```typescript
import { withCSRFProtection } from '@/lib/hooks/use-csrf';

const apiClient = {
  createProduct: async (data: ProductData) => {
    return fetch('/api/products', {
      method: 'POST',
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    });
  },
};

// Wrap with CSRF protection
const protectedApiClient = {
  createProduct: withCSRFProtection(apiClient.createProduct),
};
```

## Error Handling

CSRF validation failures return a 403 status with error details:

```typescript
const response = await fetchWithCSRF('/api/products', { method: 'POST' });

if (response.status === 403) {
  const error = await response.json();
  if (error.error === 'CSRF validation failed') {
    // Handle CSRF error - usually means token expired or missing
    console.error('CSRF token validation failed. Please refresh the page.');
  }
}
```

## Token Configuration

Default settings:
- Token length: 32 bytes (64 hex characters)
- Token expiry: 24 hours
- Cookie name: `__Host-csrf-token` (secure by default)
- Header name: `x-csrf-token`

## Exempt Endpoints

The following endpoints are exempt from CSRF checks:
- `/api/webhooks/*` - For external webhook providers
- `/api/health` - Health check endpoints
- `/api/uploadthing` - File upload endpoints
- `/api/collaboration/auth` - Collaboration authentication

## Security Considerations

1. **Always use HTTPS in production** - Cookies are set with `secure` flag
2. **Don't disable CSRF for convenience** - It's a critical security feature
3. **Keep tokens confidential** - Never log or expose CSRF tokens
4. **Handle token expiry gracefully** - Prompt users to refresh if needed

## Testing

To test CSRF protection:

1. Try making a POST request without the CSRF header:
```bash
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
# Expected: 403 Forbidden with CSRF error
```

2. Make a request with valid CSRF token:
```bash
# First get the token from browser DevTools (Application > Cookies)
curl -X POST http://localhost:3000/api/test \
  -H "Content-Type: application/json" \
  -H "x-csrf-token: YOUR_TOKEN_HERE" \
  -b "__Host-csrf-token=YOUR_TOKEN_HERE" \
  -d '{"test": "data"}'
# Expected: 200 OK
```