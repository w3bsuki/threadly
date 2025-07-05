import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { showBetaFeature } from '@repo/feature-flags';
import { NotificationsProvider } from '@repo/notifications/components/provider';
import { RealTimeWrapper } from './components/real-time-wrapper';
import type { ReactNode } from 'react';
import { PostHogIdentifier } from './components/posthog-identifier';
import { ToastProvider } from '@/components/toast';
import { AppLayout } from './components/app-layout';
import { redirect } from 'next/navigation';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';

type AppLayoutProperties = {
  readonly children: ReactNode;
};

const AuthenticatedLayout = async ({ children }: AppLayoutProperties) => {
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

  // Check if user is admin with error handling
  let isAdmin = false;
  try {
    const dbUser = await database.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });
    isAdmin = dbUser?.role === 'ADMIN';
  } catch (error) {
    logError('Database user check failed:', error);
  }

  return (
    <RealTimeWrapper userId={user.id}>
      <NotificationsProvider userId={user.id}>
        <AppLayout isAdmin={isAdmin}>
          {betaFeature && (
            <div className="mb-4 rounded-lg bg-blue-500 p-3 text-center text-sm text-white">
              Beta feature now available
            </div>
          )}
          {children}
          <ToastProvider />
        </AppLayout>
        <PostHogIdentifier />
      </NotificationsProvider>
    </RealTimeWrapper>
  );
};

export default AuthenticatedLayout;