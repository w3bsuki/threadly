'use client';

import { useAuth, useUser, SignIn, ClerkProvider } from '@clerk/nextjs';

function TestContent() {
  const { isLoaded: authLoaded, isSignedIn } = useAuth();
  const { isLoaded: userLoaded, user } = useUser();
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Clerk Test Page</h1>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Auth Status:</h2>
        <p>Auth Loaded: {authLoaded ? 'Yes' : 'No'}</p>
        <p>Is Signed In: {isSignedIn ? 'Yes' : 'No'}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">User Status:</h2>
        <p>User Loaded: {userLoaded ? 'Yes' : 'No'}</p>
        <p>User Email: {user?.primaryEmailAddress?.emailAddress || 'Not signed in'}</p>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Environment Check:</h2>
        <p>Clerk Publishable Key: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? 'Set' : 'NOT SET'}</p>
        <p>Publishable Key Value: {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.substring(0, 20)}...</p>
      </div>
      
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">SignIn Component Test:</h2>
        <SignIn />
      </div>
    </div>
  );
}

export default function TestClerkPage() {
  return (
    <ClerkProvider publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}>
      <TestContent />
    </ClerkProvider>
  );
}