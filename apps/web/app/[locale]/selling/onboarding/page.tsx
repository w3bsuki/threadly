import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { SellerOnboardingWizard } from './components/seller-onboarding-wizard';

export default async function SellerOnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<React.JSX.Element> {
  const user = await currentUser();
  const { locale } = await params;

  if (!user) {
    redirect(`/${locale}/sign-in`);
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
    // Already has a seller profile, redirect to new listing
    redirect(`/${locale}/selling/new`);
  }

  return <SellerOnboardingWizard locale={locale} userId={user.id} />;
}
