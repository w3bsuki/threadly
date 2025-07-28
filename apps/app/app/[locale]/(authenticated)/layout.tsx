import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { showBetaFeature } from '@repo/feature-flags';
import { getDictionary } from '@repo/internationalization';
import { log, logError } from '@repo/observability/server';
import { ErrorBoundary } from '@repo/utils/src/error-boundary';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { AppLayout } from './components/app-layout';
import { MobileBottomNav } from './components/mobile-bottom-nav';
import { MobileInteractions } from './components/mobile-interactions';
import { Providers } from './components/providers';

type AppLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const AuthenticatedLayout = async ({
  children,
  params,
}: AppLayoutProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  // Get beta feature flag with error handling
  let betaFeature = false;
  try {
    betaFeature = await showBetaFeature();
  } catch (error) {
    logError('Feature flag error:', error);
  }

  // Check if user is admin and has completed onboarding with error handling
  let isAdmin = false;
  let hasCompletedOnboarding = true;
  try {
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: {
        role: true,
        UserPreferences: {
          select: {
            onboardingCompleted: true,
          },
        },
      },
    });
    isAdmin = dbUser?.role === 'ADMIN';
    hasCompletedOnboarding =
      dbUser?.UserPreferences?.onboardingCompleted ?? false;
  } catch (error) {
    logError('Database user check failed:', error);
  }

  return (
    <Providers dictionary={dictionary} locale={locale} userId={user.id}>
      <MobileInteractions enableHaptic={true}>
        <AppLayout dictionary={dictionary} isAdmin={isAdmin}>
          {betaFeature && (
            <div className="mb-4 rounded-[var(--radius-lg)] bg-blue-500 p-3 text-center text-background text-sm">
              Beta feature now available
            </div>
          )}
          <ErrorBoundary>{children}</ErrorBoundary>
        </AppLayout>
        <MobileBottomNav dictionary={dictionary} />
      </MobileInteractions>
    </Providers>
  );
};

export default AuthenticatedLayout;
