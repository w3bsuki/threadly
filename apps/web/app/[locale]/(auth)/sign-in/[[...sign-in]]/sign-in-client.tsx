'use client';

import { SignIn } from '@clerk/nextjs';

export function SignInClient({
  redirectUrl,
  locale,
}: {
  redirectUrl: string;
  locale: string;
}) {
  return (
    <SignIn
      appearance={{
        elements: {
          rootBox: 'mx-auto',
          card: 'shadow-none',
        },
      }}
      path={`/${locale}/sign-in`}
      routing="path"
      signUpUrl={`/${locale}/sign-up`}
      redirectUrl={redirectUrl}
    />
  );
}
