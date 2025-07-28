import type { Metadata } from 'next';
import { SignUpClient } from './sign-up-client';

export const metadata: Metadata = {
  title: 'Sign Up - Threadly',
  description: 'Create your Threadly account',
};

interface SignUpPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ from?: string }>;
}

export default async function SignUpPage({
  params,
  searchParams,
}: SignUpPageProps) {
  const { locale } = await params;
  const { from } = await searchParams;
  const redirectUrl = from || `/${locale}`;

  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-3xl">Create Account</h1>
          <p className="mt-2 text-muted-foreground">
            Join Threadly to start buying and selling
          </p>
        </div>

        <SignUpClient locale={locale} redirectUrl={redirectUrl} />
      </div>
    </div>
  );
}
