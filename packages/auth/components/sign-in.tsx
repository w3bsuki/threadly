'use client';

import { SignIn as ClerkSignIn } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export const SignIn = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const returnTo = searchParams.get('returnTo');
  const redirectUrl = from || returnTo || '/';
  
  return (
    <ClerkSignIn
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
      afterSignInUrl={redirectUrl}
      signUpUrl={`/sign-up${redirectUrl ? `?from=${encodeURIComponent(redirectUrl)}` : ''}`}
    />
  );
};
