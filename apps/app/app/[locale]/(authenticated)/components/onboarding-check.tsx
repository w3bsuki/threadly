import { redirect } from 'next/navigation';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';

export async function checkOnboarding() {
  const user = await currentUser();
  
  if (!user) {
    return false;
  }

  try {
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: {
        preferences: {
          select: {
            onboardingCompleted: true
          }
        }
      }
    });

    return dbUser?.preferences?.onboardingCompleted ?? false;
  } catch (error) {
    console.error('Failed to check onboarding status:', error);
    return true; // Default to true to avoid blocking users on error
  }
}

export async function requireOnboarding() {
  const hasCompleted = await checkOnboarding();
  
  if (!hasCompleted) {
    redirect('/onboarding');
  }
}