import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import type { Metadata } from 'next';

type CollectionsProps = {
  params: Promise<{
    locale: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: CollectionsProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Collections - Threadly',
    description: 'Browse curated fashion collections',
  });
};

const CollectionsPage = async ({ params }: CollectionsProps) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-semibold mb-8">Collections</h1>
        <p className="text-gray-600">Curated collections coming soon.</p>
      </div>
    </main>
  );
};

export default CollectionsPage;