import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { QuickSetupButton } from './components/quick-setup-button';
import { SellerOnboardingWizard } from './components/seller-onboarding-wizard';

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ returnTo?: string }>;
}

export default async function SellerOnboardingPage({
  params,
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const user = await currentUser();
  const { locale } = await params;
  const { returnTo } = await searchParams;

  if (!user) {
    redirect('/sign-in');
  }

  // Check if seller profile already exists
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: {
      id: true,
      SellerProfile: true,
    },
  });

  if (dbUser?.SellerProfile) {
    // Already has a seller profile
    if (returnTo) {
      // Redirect to returnTo URL if provided
      redirect(returnTo);
    }
    // Otherwise redirect to dashboard
    redirect('/selling/dashboard');
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <SellerOnboardingWizard
        locale={locale}
        returnTo={returnTo}
        userId={user.id}
      />

      {/* Quick setup option if coming from web */}
      {returnTo && <QuickSetupButton returnTo={returnTo} />}
    </div>
  );
}
