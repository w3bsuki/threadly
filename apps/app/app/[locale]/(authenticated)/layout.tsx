import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { showBetaFeature } from '@repo/feature-flags';
import type { ReactNode } from 'react';
import { AppLayout } from './components/app-layout';
import { MobileBottomNav } from './components/mobile-bottom-nav';
import { MobileInteractions } from './components/mobile-interactions';
import { redirect } from 'next/navigation';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';
import { getDictionary } from '@repo/internationalization';
import { Providers } from './components/providers';
import { ErrorBoundary } from '@repo/utils/src/error-boundary';

type AppLayoutProperties = {
  readonly children: ReactNode;
  readonly params: Promise<{ locale: string }>;
};

const AuthenticatedLayout = async ({ children, params }: AppLayoutProperties) => {
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
            onboardingCompleted: true
          }
        }
      }
    });
    isAdmin = dbUser?.role === 'ADMIN';
    hasCompletedOnboarding = dbUser?.UserPreferences?.onboardingCompleted ?? false;
  } catch (error) {
    logError('Database user check failed:', error);
  }


  return (
    <Providers userId={user.id} dictionary={dictionary} locale={locale}>
      <MobileInteractions enableHaptic={true}>
        <AppLayout isAdmin={isAdmin} dictionary={dictionary}>
          {betaFeature && (
            <div className="mb-4 rounded-[var(--radius-lg)] bg-blue-500 p-3 text-center text-sm text-background">
              Beta feature now available
            </div>
          )}
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </AppLayout>
        <MobileBottomNav dictionary={dictionary} />
      </MobileInteractions>
    </Providers>
  );
};

export default AuthenticatedLayout;