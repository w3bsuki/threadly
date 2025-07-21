'use client';

import { SignUp } from '@repo/auth/client';

export function SignUpClient({ redirectUrl, locale }: { redirectUrl: string; locale: string }) {
  return (
    <SignUp 
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
      afterSignUpUrl={redirectUrl}
      signInUrl={`/${locale}/sign-in${redirectUrl !== `/${locale}` ? `?from=${encodeURIComponent(redirectUrl)}` : ''}`}
    />
  );
}