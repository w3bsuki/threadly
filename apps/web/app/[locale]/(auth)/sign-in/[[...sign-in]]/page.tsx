import type { Metadata } from 'next';
import { SignInClient } from './sign-in-client';

export const metadata: Metadata = {
  title: 'Sign In - Threadly',
  description: 'Sign in to your Threadly account',
};

interface SignInPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function SignInPage({
  params,
  searchParams,
}: SignInPageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  const redirectUrl = from || `/${locale}`;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-3xl">Welcome Back</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        <SignInClient locale={locale} redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
