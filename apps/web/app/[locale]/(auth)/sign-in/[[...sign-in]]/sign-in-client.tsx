'use client';

import { SignIn } from '@clerk/nextjs';

export function SignInClient({ redirectUrl, locale }: { redirectUrl: string; locale: string }) {
  console.log('SignInClient rendering with redirectUrl:', redirectUrl);
  
  return (
    <div>
      <p>Debug: SignIn component should appear below:</p>
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
      />
    </div>
  );
}