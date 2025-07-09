import { redirect } from 'next/navigation';
import { currentUser } from '@repo/auth/server';
import { getUserPreferences } from './actions';
import { OnboardingWizard } from './components/onboarding-wizard';

export default async function OnboardingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const preferences = await getUserPreferences(user.id);
  
  if (preferences?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-background">
      <OnboardingWizard userId={user.id} />
    </div>
  );
}