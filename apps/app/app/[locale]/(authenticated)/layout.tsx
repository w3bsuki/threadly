import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { showBetaFeature } from '@repo/feature-flags';
import type { ReactNode } from 'react';
import { AppLayout } from './components/app-layout';
import { redirect } from 'next/navigation';
import { log } from '@repo/observability/server';
import { logError } from '@repo/observability/server';
import { getDictionary } from '@repo/internationalization';
import { Providers } from './components/providers';

// Force dynamic rendering to avoid client reference manifest issues
export const dynamic = 'force-dynamic';

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
    <Providers userId={user.id} dictionary={dictionary} locale={locale}>
      <AppLayout isAdmin={isAdmin} dictionary={dictionary}>
        {betaFeature && (
          <div className="mb-4 rounded-lg bg-blue-500 p-3 text-center text-sm text-white">
            Beta feature now available
          </div>
        )}
        {children}
      </AppLayout>
    </Providers>
  );
};

export default AuthenticatedLayout;