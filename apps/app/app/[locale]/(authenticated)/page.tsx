import type { Metadata } from 'next';
import { getDictionary } from '@repo/internationalization';
import { DashboardPage } from './dashboard-page';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  
  return {
    title: dictionary.dashboard.metadata.dashboard.title,
    description: dictionary.dashboard.metadata.dashboard.description,
  };
}

export default async function Page({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return <DashboardPage locale={locale} />;
}