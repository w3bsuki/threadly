import * as React from 'react';
import { getDictionary } from '@repo/internationalization';

// Force dynamic rendering to avoid client reference manifest issues
export const dynamic = 'force-dynamic';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return children;
}