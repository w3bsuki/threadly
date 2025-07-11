import { redirect } from 'next/navigation';
import { currentUser } from '@repo/auth/server';
import { getUserPreferences } from './actions';
import { StreamlinedOnboarding } from './components/streamlined-onboarding';

export default async function OnboardingPage() {
  const user = await currentUser();
  
  if (!user) {
    redirect('/sign-in');
  }

  const preferences = await getUserPreferences(user.id);
  
  if (preferences?.onboardingCompleted) {
    redirect('/dashboard');
  }

  return <StreamlinedOnboarding userId={user.id} />;
}