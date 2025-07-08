import { currentUser } from '@repo/auth/server';
import { redirect } from 'next/navigation';
import { Header } from '../components/header';
import { SearchResults } from './components/search-results';
import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';

type SearchPageProperties = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string;
    categories?: string;
    brands?: string;
    conditions?: string;
    sizes?: string;
    priceMin?: string;
    priceMax?: string;
    sortBy?: string;
  }>;
};

export const generateMetadata = async ({
  params,
  searchParams,
}: SearchPageProperties): Promise<Metadata> => {
  const { locale } = await params;
  const { q } = await searchParams;
  const dictionary = await getDictionary(locale);

  return {
    title: q ? `${q} - ${dictionary.dashboard.search.resultsFor}` : dictionary.dashboard.metadata.search.title,
    description: q ? `${dictionary.dashboard.search.resultsFor} ${q}` : dictionary.dashboard.metadata.search.description,
  };
};

const SearchPage = async ({ params, searchParams }: SearchPageProperties) => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);
  const searchParamsData = await searchParams;
  const { q, categories, brands, conditions, sizes, priceMin, priceMax, sortBy } = searchParamsData;
  
  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Build initial filters from URL parameters
  const initialFilters = {
    query: q,
    categories: categories ? [categories] : undefined,
    brands: brands ? [brands] : undefined,
    conditions: conditions ? [conditions as any] : undefined,
    sizes: sizes ? [sizes] : undefined,
    priceMin: priceMin ? parseInt(priceMin) : undefined,
    priceMax: priceMax ? parseInt(priceMax) : undefined,
    sortBy: (sortBy || 'relevance') as 'relevance' | 'price_asc' | 'price_desc' | 'newest' | 'most_viewed' | 'most_favorited'
  };

  const displayText = categories ? `${categories.charAt(0).toUpperCase() + categories.slice(1)} ${dictionary.web.global.navigation.shop}` :
                     q ? `${dictionary.dashboard.search.resultsFor} "${q}"` : dictionary.dashboard.search.title;

  return (
    <>
      <Header 
        pages={[dictionary.dashboard.search.title]} 
        page={displayText} 
        dictionary={dictionary}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SearchResults initialFilters={initialFilters} dictionary={dictionary} />
      </div>
    </>
  );
};

export default SearchPage;
