import React from 'react';
import { vi } from 'vitest';

// Mock user data for testing
export const mockClerkUser = {
  id: 'clerk_test_user',
  emailAddresses: [{ emailAddress: 'test@example.com' }],
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  publicMetadata: {},
  privateMetadata: {},
  unsafeMetadata: {},
  createdAt: Date.now(),
  updatedAt: Date.now(),
};

export const mockDatabaseUser = {
  id: 'test_user_id',
  clerkId: 'clerk_test_user',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  imageUrl: 'https://example.com/avatar.jpg',
  location: 'Test City, TC',
  averageRating: 4.5,
  totalSales: 10,
  stripeAccountId: 'acct_test_123',
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock Clerk hooks
export function mockClerkAuth(isSignedIn = true, user = mockClerkUser) {
  const mockAuth = {
    isSignedIn,
    user: isSignedIn ? user : null,
    isLoaded: true,
    signOut: vi.fn(),
    signIn: vi.fn(),
    signUp: vi.fn(),
  };

  vi.mock('@clerk/nextjs', async () => {
    const actual = await vi.importActual('@clerk/nextjs');
    return {
      ...actual,
      useAuth: () => mockAuth,
      useUser: () => ({ user: mockAuth.user, isLoaded: true }),
      auth: () => Promise.resolve(mockAuth),
      currentUser: () => Promise.resolve(mockAuth.user),
      ClerkProvider: ({ children }: { children: React.ReactNode }) => children,
      SignInButton: ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          'button',
          { 'data-testid': 'sign-in-button' },
          children
        );
      },
      SignUpButton: ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          'button',
          { 'data-testid': 'sign-up-button' },
          children
        );
      },
      SignOutButton: ({ children }: { children: React.ReactNode }) => {
        return React.createElement(
          'button',
          {
            'data-testid': 'sign-out-button',
            onClick: mockAuth.signOut,
          },
          children
        );
      },
      UserButton: () =>
        React.createElement(
          'div',
          { 'data-testid': 'user-button' },
          'User Menu'
        ),
    };
  });

  return mockAuth;
}

// Mock session token for API calls
export function mockSessionToken(token = 'test_session_token') {
  vi.mock('@clerk/nextjs/server', async () => {
    const actual = await vi.importActual('@clerk/nextjs/server');
    return {
      ...actual,
      auth: () => ({
        getToken: () => Promise.resolve(token),
        userId: mockClerkUser.id,
        sessionId: 'test_session_id',
      }),
      getAuth: () => ({
        getToken: () => Promise.resolve(token),
        userId: mockClerkUser.id,
        sessionId: 'test_session_id',
      }),
    };
  });

  return token;
}

// Helper to test protected routes
export function createAuthenticatedUser(
  overrides?: Partial<typeof mockDatabaseUser>
) {
  return {
    ...mockDatabaseUser,
    ...overrides,
  };
}

export function createUnauthenticatedState() {
  return mockClerkAuth(false, undefined);
}

// Mock authentication middleware
export function mockAuthMiddleware(isAuthenticated = true) {
  const middleware = vi.fn((req: any, res: any, next: any) => {
    if (isAuthenticated) {
      req.user = mockDatabaseUser;
      req.auth = { userId: mockClerkUser.id };
    }
    next();
  });

  return middleware;
}

// Helper to simulate authentication state changes
export class AuthTestHelper {
  private static instance: AuthTestHelper;
  private authState = {
    isSignedIn: false,
    user: null as any,
    isLoaded: true,
  };

  static getInstance() {
    if (!AuthTestHelper.instance) {
      AuthTestHelper.instance = new AuthTestHelper();
    }
    return AuthTestHelper.instance;
  }

  signIn(user = mockClerkUser) {
    this.authState = {
      isSignedIn: true,
      user,
      isLoaded: true,
    };
    return this.authState;
  }

  signOut() {
    this.authState = {
      isSignedIn: false,
      user: null,
      isLoaded: true,
    };
    return this.authState;
  }

  setLoading(isLoaded = false) {
    this.authState.isLoaded = isLoaded;
    return this.authState;
  }

  getState() {
    return { ...this.authState };
  }

  reset() {
    this.authState = {
      isSignedIn: false,
      user: null,
      isLoaded: true,
    };
  }
}

// Helper to test role-based access
export function createUserWithRole(
  role: 'USER' | 'ADMIN' | 'MODERATOR' = 'USER'
) {
  return {
    ...mockDatabaseUser,
    role,
  };
}

// Mock webhook events
export function createMockWebhookEvent(type: string, data: any = {}) {
  return {
    type,
    data: {
      id: mockClerkUser.id,
      email_addresses: [{ email_address: 'test@example.com' }],
      first_name: 'Test',
      last_name: 'User',
      image_url: 'https://example.com/avatar.jpg',
      created_at: Date.now(),
      updated_at: Date.now(),
      ...data,
    },
    object: 'event',
    evt: {
      data,
      object: 'user',
      type,
    },
  };
}

// Helper to test authentication flows
export async function simulateAuthFlow(
  action: 'signIn' | 'signUp' | 'signOut',
  user = mockClerkUser
) {
  const helper = AuthTestHelper.getInstance();

  switch (action) {
    case 'signIn':
      return helper.signIn(user);
    case 'signUp':
      return helper.signIn(user);
    case 'signOut':
      return helper.signOut();
    default:
      throw new Error(`Unknown auth action: ${action}`);
  }
}

// Test permissions helper
export function testPermissions(userRole: string, requiredRole: string) {
  const roleHierarchy = {
    USER: 0,
    MODERATOR: 1,
    ADMIN: 2,
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] ?? -1;
  const requiredLevel =
    roleHierarchy[requiredRole as keyof typeof roleHierarchy] ?? 999;

  return userLevel >= requiredLevel;
}

export { mockClerkUser as mockUser, mockDatabaseUser as mockDbUser };
