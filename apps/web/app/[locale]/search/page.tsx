import { getDictionary } from '@repo/content/internationalization';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

// Dynamic import for search results to reduce initial bundle size
const SearchResults = dynamic(
  () =>
    import('./components/search-results').then((mod) => ({
      default: mod.SearchResults,
    })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-8 animate-pulse rounded bg-accent" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="h-64 animate-pulse rounded bg-accent" key={i} />
          ))}
        </div>
      </div>
    ),
  }
);

interface SearchPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    category?: string;
    brand?: string;
    size?: string;
    minPrice?: string;
    maxPrice?: string;
    condition?: string;
    sort?: string;
  }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const { locale } = await params;
  const { q: query = '' } = await searchParams;
  const _dictionary = await getDictionary(locale);

  return {
    title: query
      ? `Search results for "${query}" - Threadly`
      : 'Search - Threadly',
    description: query
      ? `Find products matching "${query}" on Threadly marketplace`
      : 'Search for clothing and accessories',
  };
}

export default async function SearchPage({
  params,
  searchParams,
}: SearchPageProps) {
  const { locale } = await params;
  const searchParams_ = await searchParams;
  const query = searchParams_.q || '';
  const _dictionary = await getDictionary(locale);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SearchResults initialQuery={query} />
      </div>
    </div>
  );
}
