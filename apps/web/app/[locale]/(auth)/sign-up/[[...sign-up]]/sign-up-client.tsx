'use client';

import { SignUp } from '@repo/auth/auth/client';

export function SignUpClient({
  redirectUrl,
  locale,
}: {
  redirectUrl: string;
  locale: string;
}) {
  return (
    <SignUp
      afterSignUpUrl={redirectUrl}
      appearance={{
        elements: {
          header: 'hidden',
        },
      }}
      signInUrl={`/${locale}/sign-in${redirectUrl !== `/${locale}` ? `?from=${encodeURIComponent(redirectUrl)}` : ''}`}
    />
  );
}
