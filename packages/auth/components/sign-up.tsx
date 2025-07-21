'use client';

import { SignUp as ClerkSignUp } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';

export const SignUp = () => {
  const searchParams = useSearchParams();
  const from = searchParams.get('from');
  const returnTo = searchParams.get('returnTo');
  const redirectUrl = from || returnTo || '/';
  
  return (
    <ClerkSignUp
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
      afterSignUpUrl={redirectUrl}
      signInUrl={`/sign-in${redirectUrl ? `?from=${encodeURIComponent(redirectUrl)}` : ''}`}
    />
  );
};
