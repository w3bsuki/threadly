import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import for products content to reduce initial bundle size
const ProductsContent = dynamic(
  () =>
    import('./components/products-content').then((mod) => ({
      default: mod.ProductsContent,
    })),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="h-12 animate-pulse rounded bg-accent" />
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div className="space-y-2" key={i}>
              <div className="aspect-square animate-pulse rounded bg-accent" />
              <div className="h-4 animate-pulse rounded bg-accent" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-accent" />
            </div>
          ))}
        </div>
      </div>
    ),
  }
);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return {
    title: 'Products - Threadly',
    description: 'Browse our collection of clothing and accessories',
  };
}

export default async function ProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    category?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
    page?: string;
    q?: string;
  }>;
}) {
  const { locale } = await params;
  const resolvedSearchParams = await searchParams;
  const dictionary = await getDictionary(locale);

  return (
    <ProductsContent
      dictionary={dictionary}
      searchParams={resolvedSearchParams}
    />
  );
}
