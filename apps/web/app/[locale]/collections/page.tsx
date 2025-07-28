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
  const _dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Collections - Threadly',
    description: 'Browse curated fashion collections',
  });
};

const CollectionsPage = async ({ params }: CollectionsProps) => {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 font-semibold text-3xl">Collections</h1>
        <p className="text-muted-foreground">
          Curated collections coming soon.
        </p>
      </div>
    </main>
  );
};

export default CollectionsPage;
