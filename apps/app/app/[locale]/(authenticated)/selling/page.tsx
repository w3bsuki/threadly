import { redirect } from 'next/navigation';

interface SellingPageProps {
  params: Promise<{ locale: string }>;
}

export default async function SellingPage({ params }: SellingPageProps): Promise<React.JSX.Element> {
  const { locale } = await params;
  // Redirect to new product page as the main selling page
  redirect(`/${locale}/selling/new`);
}