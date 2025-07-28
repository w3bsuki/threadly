'use client';

import { ClerkProvider, SignIn, useAuth, useUser } from '@clerk/nextjs';

function TestContent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();

  return (
    <div className="container mx-auto p-8">
      <h1 className="mb-4 font-bold text-2xl">Clerk Test Page</h1>

      <div className="mb-4">
        <h2 className="font-semibold text-xl">Auth Status:</h2>
        <p>Auth Loaded: {authLoaded ? 'Yes' : 'No'}</p>
        <p>Is Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-xl">User Status:</h2>
        <p>User Loaded: {userLoaded ? 'Yes' : 'No'}</p>
        <p>
          User Email:{' '}
          {user?.primaryEmailAddress?.emailAddress || 'Not signed in'}
        </p>
      </div>

      <div className="mb-4">
        <h2 className="font-semibold text-xl">Environment Check:</h2>
        <p>
          Clerk Publishable Key:{' '}
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'NOT SET'}
        </p>
        <p>
          Publishable Key Value:{' '}
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...
        </p>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 font-semibold text-xl">SignIn Component Test:</h2>
        <SignIn />
      </div>
    </div>
  );
}

export default function TestClerkPage() {
  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <TestContent />
    </ClerkProvider>
  );
}
