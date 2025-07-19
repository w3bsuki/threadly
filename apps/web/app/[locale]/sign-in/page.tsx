import { SignIn } from '@repo/auth/client';

export default function SignInPage() {
  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center px-4 py-12">
      <SignIn />
    </div>
  );
}