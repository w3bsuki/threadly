import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';

export async function checkOnboarding() {
  const user = await currentUser();

  if (!user) {
    return false;
  }

  try {
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: {
        UserPreferences: {
          select: {
            onboardingCompleted: true,
          },
        },
      },
    });

    return dbUser?.UserPreferences?.onboardingCompleted ?? false;
  } catch (error) {
    return true; // Default to true to avoid blocking users on error
  }
}

export async function requireOnboarding() {
  const hasCompleted = await checkOnboarding();

  if (!hasCompleted) {
    redirect('/onboarding');
  }
}
