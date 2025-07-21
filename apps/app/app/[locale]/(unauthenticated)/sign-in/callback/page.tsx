import { redirect } from 'next/navigation';

interface CallbackPageProps {
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function SignInCallbackPage({ searchParams }: CallbackPageProps) {
  const { returnTo } = await searchParams;
  
  // If we have a returnTo URL, redirect there
  if (returnTo) {
    redirect(returnTo);
  }
  
  // Otherwise go to dashboard
  redirect('/dashboard');
}