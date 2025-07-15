import { Suspense } from 'react';
import { currentUser } from '@repo/auth/server';
import { database } from '@repo/database';
import { redirect } from 'next/navigation';
import { MarketingDashboard } from './components/marketing-dashboard';
import { MarketingSkeleton } from './components/marketing-skeleton';
import { getDictionary } from '@repo/internationalization/get-dictionary';
import type { Locale } from '@repo/internationalization/locales';

interface MarketingPageProps {
  params: Promise<{
    locale: Locale;
  }>;
  searchParams: Promise<{
    view?: 'overview' | 'discounts' | 'featured';
  }>;
}

export default async function MarketingPage({ params, searchParams }: MarketingPageProps) {
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  const { locale } = await params;
  const { view = 'overview' } = await searchParams;
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
        <h1 className="text-3xl font-bold">Marketing Tools</h1>
        <p className="text-muted-foreground mt-1">
          Boost your sales with discounts and featured listings
        </p>
      </div>

      <Suspense fallback={<MarketingSkeleton />}>
        <MarketingDashboard 
          userId={dbUser.id} 
          view={view}
          dictionary={dictionary}
        />
      </Suspense>
    </div>
  );
}