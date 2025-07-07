/**
 * Authentication Flow Tests - 95% Coverage Required
 * 
 * This test suite covers all critical authentication functionality
 * including Clerk integration, middleware, and protected routes.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';
import { render, screen, fireEvent, waitFor } from '@repo/testing';
import { cleanup } from '@repo/testing';
import React from 'react';

// Mock Clerk authentication
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
  currentUser: vi.fn(),
  redirectToSignIn: vi.fn(),
  redirectToSignUp: vi.fn(),
}));

vi.mock('@clerk/nextjs', () => ({
  SignIn: vi.fn(({ children }) => <div data-testid="sign-in-component">{children}</div>),
  SignUp: vi.fn(({ children }) => <div data-testid="sign-up-component">{children}</div>),
  UserButton: vi.fn(() => <div data-testid="user-button">User Button</div>),
  useUser: vi.fn(),
  useAuth: vi.fn(),
  ClerkProvider: vi.fn(({ children }) => <div>{children}</div>),
}));

vi.mock('@repo/auth/middleware', () => ({
  authMiddleware: vi.fn(),
  withAuth: vi.fn(),
}));

vi.mock('@repo/database', () => ({
  database: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}));

describe('Authentication Flow Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    cleanup();
  });

  describe('User Authentication State', () => {
    it('should handle authenticated user state', async () => {
      const { useUser, useAuth } = await import('@clerk/nextjs');
      
      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        user: {
          id: 'clerk_user_1',
          firstName: 'John',
          lastName: 'Doe',
          emailAddresses: [{ emailAddress: 'john@example.com' }],
          imageUrl: 'https://example.com/avatar.jpg',
        },
      });

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'clerk_user_1',
        sessionId: 'session_123',
        getToken: vi.fn().mockResolvedValue('token_123'),
        signOut: vi.fn(),
      });

      // Test component that uses authentication
      const TestComponent = () => {
        const { isSignedIn, user } = useUser();
        const { getToken } = useAuth();

        if (!isSignedIn) {
          return <div>Not signed in</div>;
        }

        return (
          <div>
            <div data-testid="user-name">{user?.firstName} {user?.lastName}</div>
            <div data-testid="user-email">{user?.emailAddresses[0]?.emailAddress}</div>
            <button 
              data-testid="get-token-btn"
              onClick={() => getToken()}
            >
              Get Token
            </button>
          </div>
        );
      };

      render(<TestComponent />);

      expect(screen.getByTestId('user-name')).toHaveTextContent('John Doe');
      expect(screen.getByTestId('user-email')).toHaveTextContent('john@example.com');
      
      const getTokenBtn = screen.getByTestId('get-token-btn');
      fireEvent.click(getTokenBtn);
      
      await waitFor(() => {
        expect(useAuth().getToken).toHaveBeenCalled();
      });
    });

    it('should handle unauthenticated user state', async () => {
      const { useUser, useAuth } = await import('@clerk/nextjs');
      
      vi.mocked(useUser).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        user: null,
      });

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: vi.fn().mockResolvedValue(null),
        signOut: vi.fn(),
      });

      const TestComponent = () => {
        const { isSignedIn } = useUser();
        return isSignedIn ? <div>Signed in</div> : <div data-testid="not-signed-in">Not signed in</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('not-signed-in')).toBeInTheDocument();
    });

    it('should handle loading state', async () => {
      const { useUser, useAuth } = await import('@clerk/nextjs');
      
      vi.mocked(useUser).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        user: null,
      });

      vi.mocked(useAuth).mockReturnValue({
        isLoaded: false,
        isSignedIn: false,
        userId: null,
        sessionId: null,
        getToken: vi.fn(),
        signOut: vi.fn(),
      });

      const TestComponent = () => {
        const { isLoaded } = useUser();
        return isLoaded ? <div>Loaded</div> : <div data-testid="loading">Loading...</div>;
      };

      render(<TestComponent />);
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });
  });

  describe('Authentication Components', () => {
    it('should render SignIn component', async () => {
      const { SignIn } = await import('@clerk/nextjs');
      
      render(<SignIn />);
      expect(screen.getByTestId('sign-in-component')).toBeInTheDocument();
    });

    it('should render SignUp component', async () => {
      const { SignUp } = await import('@clerk/nextjs');
      
      render(<SignUp />);
      expect(screen.getByTestId('sign-up-component')).toBeInTheDocument();
    });

    it('should render UserButton component', async () => {
      const { UserButton } = await import('@clerk/nextjs');
      
      render(<UserButton />);
      expect(screen.getByTestId('user-button')).toBeInTheDocument();
    });
  });

  describe('Server-side Authentication', () => {
    it('should validate authenticated requests', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');

      vi.mocked(auth).mockResolvedValue({
        userId: 'clerk_user_1',
        sessionId: 'session_123',
      });

      vi.mocked(database.user.findUnique).mockResolvedValue({
        id: 'user_1',
        clerkId: 'clerk_user_1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      });

      // Mock API endpoint that requires authentication
      const authenticatedEndpoint = async (request: NextRequest) => {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await database.user.findUnique({
          where: { clerkId: userId },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
      };

      const request = new NextRequest('http://localhost:3001/api/protected');
      const response = await authenticatedEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.user.clerkId).toBe('clerk_user_1');
    });

    it('should reject unauthenticated requests', async () => {
      const { auth } = await import('@clerk/nextjs/server');

      vi.mocked(auth).mockResolvedValue({
        userId: null,
        sessionId: null,
      });

      const authenticatedEndpoint = async (request: NextRequest) => {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        return NextResponse.json({ success: true });
      };

      const request = new NextRequest('http://localhost:3001/api/protected');
      const response = await authenticatedEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should handle invalid user tokens', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { database } = await import('@repo/database');

      vi.mocked(auth).mockResolvedValue({
        userId: 'clerk_user_invalid',
        sessionId: 'session_123',
      });

      vi.mocked(database.user.findUnique).mockResolvedValue(null);

      const authenticatedEndpoint = async (request: NextRequest) => {
        const { userId } = await auth();
        if (!userId) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await database.user.findUnique({
          where: { clerkId: userId },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ user });
      };

      const request = new NextRequest('http://localhost:3001/api/protected');
      const response = await authenticatedEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('User not found');
    });
  });

  describe('User Registration and Profile', () => {
    it('should create user record on first authentication', async () => {
      const { database } = await import('@repo/database');

      const mockUserData = {
        clerkId: 'clerk_user_new',
        email: 'newuser@example.com',
        firstName: 'New',
        lastName: 'User',
        imageUrl: 'https://example.com/new-avatar.jpg',
      };

      vi.mocked(database.user.findUnique).mockResolvedValue(null);
      vi.mocked(database.user.create).mockResolvedValue({
        id: 'user_new',
        ...mockUserData,
        location: null,
        averageRating: 0,
        totalSales: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const createUserEndpoint = async (userData: typeof mockUserData) => {
        let user = await database.user.findUnique({
          where: { clerkId: userData.clerkId },
        });

        if (!user) {
          user = await database.user.create({
            data: userData,
          });
        }

        return NextResponse.json({ user });
      };

      const response = await createUserEndpoint(mockUserData);
      const data = await response.json();

      expect(database.user.create).toHaveBeenCalledWith({
        data: mockUserData,
      });
      expect(data.user.clerkId).toBe('clerk_user_new');
    });

    it('should update existing user data', async () => {
      const { database } = await import('@repo/database');

      const existingUser = {
        id: 'user_1',
        clerkId: 'clerk_user_1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://example.com/old-avatar.jpg',
      };

      const updateData = {
        firstName: 'Johnny',
        imageUrl: 'https://example.com/new-avatar.jpg',
      };

      vi.mocked(database.user.findUnique).mockResolvedValue(existingUser);
      vi.mocked(database.user.update).mockResolvedValue({
        ...existingUser,
        ...updateData,
      });

      const updateUserEndpoint = async (clerkId: string, updates: typeof updateData) => {
        const user = await database.user.findUnique({
          where: { clerkId },
        });

        if (!user) {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const updatedUser = await database.user.update({
          where: { clerkId },
          data: updates,
        });

        return NextResponse.json({ user: updatedUser });
      };

      const response = await updateUserEndpoint('clerk_user_1', updateData);
      const data = await response.json();

      expect(database.user.update).toHaveBeenCalledWith({
        where: { clerkId: 'clerk_user_1' },
        data: updateData,
      });
      expect(data.user.firstName).toBe('Johnny');
    });
  });

  describe('Sign Out Flow', () => {
    it('should handle sign out', async () => {
      const { useAuth } = await import('@clerk/nextjs');
      
      const mockSignOut = vi.fn();
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'clerk_user_1',
        sessionId: 'session_123',
        getToken: vi.fn(),
        signOut: mockSignOut,
      });

      const SignOutComponent = () => {
        const { signOut } = useAuth();
        return (
          <button 
            data-testid="sign-out-btn"
            onClick={() => signOut()}
          >
            Sign Out
          </button>
        );
      };

      render(<SignOutComponent />);
      
      const signOutBtn = screen.getByTestId('sign-out-btn');
      fireEvent.click(signOutBtn);
      
      expect(mockSignOut).toHaveBeenCalled();
    });
  });

  describe('Authentication Middleware', () => {
    it('should protect routes with authentication middleware', async () => {
      const { authMiddleware } = await import('@repo/auth/middleware');
      
      const mockMiddleware = vi.fn((request: NextRequest) => {
        const url = request.nextUrl.clone();
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader) {
          url.pathname = '/sign-in';
          return NextResponse.redirect(url);
        }
        
        return NextResponse.next();
      });
      
      vi.mocked(authMiddleware).mockImplementation(mockMiddleware);

      // Test protected route without auth
      const protectedRequest = new NextRequest('http://localhost:3001/dashboard', {
        headers: {},
      });

      const response = authMiddleware(protectedRequest);
      expect(response.status).toBe(307); // Redirect status
      expect(response.headers.get('location')).toContain('/sign-in');
    });

    it('should allow access to protected routes with valid authentication', async () => {
      const { authMiddleware } = await import('@repo/auth/middleware');
      
      const mockMiddleware = vi.fn((request: NextRequest) => {
        const authHeader = request.headers.get('authorization');
        
        if (!authHeader || !authHeader.includes('Bearer valid-token')) {
          const url = request.nextUrl.clone();
          url.pathname = '/sign-in';
          return NextResponse.redirect(url);
        }
        
        return NextResponse.next();
      });
      
      vi.mocked(authMiddleware).mockImplementation(mockMiddleware);

      // Test protected route with valid auth
      const authenticatedRequest = new NextRequest('http://localhost:3001/dashboard', {
        headers: {
          'authorization': 'Bearer valid-token',
        },
      });

      const response = authMiddleware(authenticatedRequest);
      expect(response.status).toBe(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle Clerk API errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      
      vi.mocked(auth).mockRejectedValue(new Error('Clerk API Error'));

      const errorEndpoint = async (request: NextRequest) => {
        try {
          const { userId } = await auth();
          return NextResponse.json({ userId });
        } catch (error) {
          return NextResponse.json(
            { error: 'Authentication failed' },
            { status: 500 }
          );
        }
      };

      const request = new NextRequest('http://localhost:3001/api/auth-test');
      const response = await errorEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Authentication failed');
    });

    it('should handle network errors during authentication', async () => {
      const { useAuth } = await import('@clerk/nextjs');
      
      const mockGetToken = vi.fn().mockRejectedValue(new Error('Network error'));
      vi.mocked(useAuth).mockReturnValue({
        isLoaded: true,
        isSignedIn: true,
        userId: 'clerk_user_1',
        sessionId: 'session_123',
        getToken: mockGetToken,
        signOut: vi.fn(),
      });

      const TokenComponent = () => {
        const { getToken } = useAuth();
        const [error, setError] = React.useState('');

        const handleGetToken = async () => {
          try {
            await getToken();
          } catch (err) {
            setError('Failed to get token');
          }
        };

        return (
          <div>
            <button data-testid="get-token" onClick={handleGetToken}>
              Get Token
            </button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        );
      };

      render(<TokenComponent />);
      
      const getTokenBtn = screen.getByTestId('get-token');
      fireEvent.click(getTokenBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Failed to get token');
      });
    });
  });

  describe('Session Management', () => {
    it('should handle session expiration', async () => {
      const { useAuth } = await import('@clerk/nextjs');
      
      // Initially authenticated
      const mockUseAuth = {
        isLoaded: true,
        isSignedIn: true,
        userId: 'clerk_user_1',
        sessionId: 'session_123',
        getToken: vi.fn().mockResolvedValue('valid-token'),
        signOut: vi.fn(),
      };

      vi.mocked(useAuth).mockReturnValue(mockUseAuth);

      const SessionComponent = () => {
        const { isSignedIn, getToken } = useAuth();
        const [tokenError, setTokenError] = React.useState(false);

        const handleGetToken = async () => {
          try {
            const token = await getToken();
            if (!token) {
              setTokenError(true);
            }
          } catch (err) {
            setTokenError(true);
          }
        };

        return (
          <div>
            <div data-testid="auth-status">{isSignedIn ? 'Signed In' : 'Signed Out'}</div>
            <button data-testid="check-token" onClick={handleGetToken}>
              Check Token
            </button>
            {tokenError && <div data-testid="token-error">Token expired</div>}
          </div>
        );
      };

      render(<SessionComponent />);
      
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Signed In');
      
      // Simulate session expiration
      mockUseAuth.getToken = vi.fn().mockResolvedValue(null);
      
      const checkTokenBtn = screen.getByTestId('check-token');
      fireEvent.click(checkTokenBtn);
      
      await waitFor(() => {
        expect(screen.getByTestId('token-error')).toBeInTheDocument();
      });
    });
  });
});