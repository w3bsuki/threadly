import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

type CategoriesProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: CategoriesProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Categories - Threadly',
    description: 'Browse all fashion categories',
  });
};

const CategoriesPage = async ({ params }: CategoriesProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">All Categories</h1>
        <p className="text-gray-600">Browse by category coming soon.</p>
      </div>
    </main>
  );
};

export default CategoriesPage;