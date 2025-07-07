import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

type FavoritesProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: FavoritesProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Favorites - Threadly',
    description: 'Your favorite fashion items',
  });
};

const FavoritesPage = async ({ params }: FavoritesProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">Your Favorites</h1>
        <p className="text-gray-600">Sign in to see your favorite items.</p>
      </div>
    </main>
  );
};

export default FavoritesPage;