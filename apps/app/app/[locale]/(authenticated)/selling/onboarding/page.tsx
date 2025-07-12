import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import { SellerOnboardingWizard } from './components/seller-onboarding-wizard';
import { database } from '@repo/database';

export default async function SellerOnboardingPage(): Promise<React.JSX.Element> {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  // Check if seller profile already exists
  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id },
    select: { 
      id: true,
      sellerProfile: true 
    }
  });

  if (dbUser?.sellerProfile) {
    // Already has a seller profile, redirect to dashboard
    redirect('/selling/dashboard');
  }

  return <SellerOnboardingWizard userId={user.id} />;
}