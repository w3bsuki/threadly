import { currentUser } from '@repo/auth/server';
import { cache } from '@repo/cache';
import { database } from '@repo/database';
import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { Header } from '../components/header';
import { SearchResults } from './components/search-results';

const paramsSchema = z.object({
  locale: z.string(),
});

const searchParamsSchema = z.object({
  q: z
    .string()
    .optional()
    .transform((val) => (val ? val.trim().replace(/[<>]/g, '') : undefined)),
  categories: z.string().optional(),
  brands: z.string().optional(),
  conditions: z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR']).optional(),
  sizes: z.string().optional(),
  priceMin: z.string().regex(/^\d+$/).optional(),
  priceMax: z.string().regex(/^\d+$/).optional(),
  sortBy: z
    .enum([
      'relevance',
      'price_asc',
      'price_desc',
      'newest',
      'most_viewed',
      'most_favorited',
    ])
    .optional()
    .default('relevance'),
});

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
  const rawParams = await params;
  const { locale } = paramsSchema.parse(rawParams);
  const rawSearchParams = await searchParams;
  const { q } = searchParamsSchema.parse(rawSearchParams);
  const dictionary = await getDictionary(locale);

  return {
    title: q
      ? `${q} - ${dictionary.dashboard.search.resultsFor}`
      : dictionary.dashboard.metadata.search.title,
    description: q
      ? `${dictionary.dashboard.search.resultsFor} ${q}`
      : dictionary.dashboard.metadata.search.description,
  };
};

const SearchPage = async ({ params, searchParams }: SearchPageProperties) => {
  const rawParams = await params;
  const { locale } = paramsSchema.parse(rawParams);
  const dictionary = await getDictionary(locale);

  const rawSearchParams = await searchParams;
  const validatedSearchParams = searchParamsSchema.parse(rawSearchParams);
  const {
    q,
    categories,
    brands,
    conditions,
    sizes,
    priceMin,
    priceMax,
    sortBy,
  } = validatedSearchParams;

  const user = await currentUser();
  if (!user) {
    redirect('/sign-in');
  }

  // Cache user lookup for search
  const dbUser = await cache.remember(
    `user:${user.id}:search`,
    async () => {
      return await database.user.findUnique({
        where: { clerkId: user.id },
        select: { id: true },
      });
    },
    300
  );

  if (!dbUser) {
    redirect('/sign-in');
  }

  // Build initial filters from URL parameters
  const initialFilters = {
    query: q,
    categories: categories ? [categories] : undefined,
    brands: brands ? [brands] : undefined,
    conditions: conditions ? [conditions] : undefined,
    sizes: sizes ? [sizes] : undefined,
    priceMin: priceMin ? Number.parseInt(priceMin) : undefined,
    priceMax: priceMax ? Number.parseInt(priceMax) : undefined,
    sortBy,
  };

  const displayText = categories
    ? `${categories.charAt(0).toUpperCase() + categories.slice(1)} ${dictionary.web.global.navigation.shop}`
    : q
      ? `${dictionary.dashboard.search.resultsFor} "${q}"`
      : dictionary.dashboard.search.title;

  return (
    <>
      <Header
        dictionary={dictionary}
        page={displayText}
        pages={[dictionary.dashboard.search.title]}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <SearchResults
          dictionary={dictionary}
          initialFilters={initialFilters}
        />
      </div>
    </>
  );
};

export default SearchPage;
