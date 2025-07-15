import { Suspense } from 'react';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { FinancialDashboard } from './components/financial-dashboard';
import { FinancialSkeleton } from './components/financial-skeleton';
import { getDictionary } from '@repo/internationalization/get-dictionary';
import type { Locale } from '@repo/internationalization/locales';

interface FinancialsPageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams: Promise<{
    period?: string;
    view?: 'overview' | 'transactions' | 'reports' | 'expenses';
  }>;
}

export default async function FinancialsPage({ params, searchParams }: FinancialsPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { locale } = await params;
  const { period = 'month', view = 'overview' } = await searchParams;
  const dictionary = await getDictionary(locale);

  const dbUser = await database.user.findUnique({
    where: { clerkId: user.id }
  });

  if (!dbUser) {
    redirect('/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Financial Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your earnings, expenses, and tax obligations
        </p>
      </div>

      <Suspense fallback={<FinancialSkeleton />}>
        <FinancialDashboard 
          userId={dbUser.id} 
          period={period}
          view={view}
          dictionary={dictionary}
        />
      </Suspense>
    </div>
  );
}