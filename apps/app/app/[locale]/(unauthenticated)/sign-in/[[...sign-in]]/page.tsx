import { getDictionary } from '@repo/content/internationalization';
import { createMetadata } from '@repo/content/seo/metadata';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

const SignIn = dynamic(() =>
  import('@repo/auth/components/sign-in').then((mod) => mod.SignIn)
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Sign In',
    description: 'Sign in to your seller account',
  });
}

const SignInPage = async ({
  params,
}: {
  params: Promise<{ locale: string }>;
}) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <>
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="font-semibold text-2xl tracking-tight">Welcome back</h1>
        <p className="text-muted-foreground text-sm">
          Enter your details to sign in.
        </p>
      </div>
      <SignIn />
    </>
  );
};

export default SignInPage;
