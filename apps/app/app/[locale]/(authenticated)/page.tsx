import RedirectComponent from './redirect';

export default async function AuthenticatedPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return <RedirectComponent locale={locale} />;
}