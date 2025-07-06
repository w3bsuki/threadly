# @repo/auth

## Overview
Authentication package for Threadly marketplace using Clerk for secure, scalable authentication. Provides server and client-side authentication utilities with role-based access control.

## Installation
```bash
pnpm add @repo/auth
```

## Setup & Configuration
Required environment variables in your app's `.env`:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
```

## API Reference

### Server-side Authentication
```typescript
import { auth, currentUser, redirectToSignIn } from '@repo/auth/server';

// Get authenticated user ID
const { userId } = await auth();

// Get full user object
const user = await currentUser();

// Protect server components
if (!userId) {
  redirectToSignIn();
}
```

### Client-side Authentication
```typescript
import { useAuth, useUser, SignInButton, UserButton } from '@repo/auth/client';

// React hooks
const { userId, isLoaded, isSignedIn } = useAuth();
const { user, isLoaded } = useUser();

// UI Components
<SignInButton mode="modal" />
<UserButton afterSignOutUrl="/" />
```

### Middleware Protection
```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@repo/auth/middleware';

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/forum(.*)',
]);

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

### User Roles & Permissions
```typescript
import { isAdminUser, isModeratorUser, UserRole } from '@repo/auth';

// Type definitions
type UserRole = 'USER' | 'MODERATOR' | 'ADMIN';

// Check permissions
const user = await currentUser();
if (isAdminUser(user)) {
  // Admin-only logic
}

if (isModeratorUser(user)) {
  // Moderator or admin logic
}
```

### Admin Client Pattern (App-specific)
```typescript
// In your app, create an admin client
import { createAdminClient } from '@repo/auth/admin-client';
import { database } from '@repo/database';

const adminClient = createAdminClient(database);

// Use in server actions
export async function deleteProduct(productId: string) {
  await adminClient.requireAdmin();
  // Admin-only logic
}
```

## Usage Examples

### Protected Server Component
```typescript
import { auth } from '@repo/auth/server';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  return <Dashboard userId={userId} />;
}
```

### Protected API Route
```typescript
import { auth } from '@repo/auth/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch user data
  return NextResponse.json({ userId });
}
```

### Client Component with User Info
```typescript
'use client';

import { useUser } from '@repo/auth/client';

export function UserProfile() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) return <div>Loading...</div>;
  if (!user) return <div>Not signed in</div>;

  return (
    <div>
      <h1>Welcome, {user.firstName}!</h1>
      <p>Email: {user.emailAddresses[0]?.emailAddress}</p>
    </div>
  );
}
```

## Testing
```bash
# Type checking
pnpm typecheck

# Run tests (when implemented)
pnpm test
```

## Dependencies
- **@clerk/nextjs**: Core authentication functionality
- **@clerk/themes**: Pre-built authentication UI themes
- **@repo/observability**: Error tracking and logging
- **@t3-oss/env-nextjs**: Environment variable validation
- **zod**: Schema validation for environment variables

## Security Best Practices
1. Always validate user permissions server-side
2. Use `server-only` imports for sensitive operations
3. Implement proper RBAC with user roles
4. Never expose sensitive user data to client
5. Use Clerk webhooks for user lifecycle events

## Migration Notes
- The direct `requireAdmin`, `isAdmin`, and `canModerate` functions are deprecated
- Use app-level `createAdminClient` pattern instead
- All authentication should go through Clerk's SDK