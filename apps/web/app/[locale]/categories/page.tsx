import { database } from '@repo/database';
import { getDictionary } from '@repo/content/internationalization';
import { createMetadata } from '@repo/content/seo/metadata';
import type { Metadata } from 'next';
import { cache } from 'react';
import { CategoryGrid } from './components/category-grid';
import { CategorySearch } from './components/category-search';

export const revalidate = 3600; // 1 hour

const getCategoriesWithCounts = cache(async (search?: string) => {
  return await database.category.findMany({
    where: {
      parentId: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      _count: {
        select: {
          Product: {
            where: { status: 'AVAILABLE' },
          },
        },
      },
      children: {
        include: {
          _count: {
            select: {
              Product: {
                where: { status: 'AVAILABLE' },
              },
            },
          },
        },
      },
    },
    orderBy: {
      Product: { _count: 'desc' },
    },
  });
});

type CategoriesProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    search?: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: CategoriesProps): Promise<Metadata> => {
  const { locale } = await params;
  const _dictionary = await getDictionary(locale);

  return createMetadata({
    title: 'Categories - Threadly',
    description: 'Browse all fashion categories',
  });
};

const CategoriesPage = async ({ params, searchParams }: CategoriesProps) => {
  const { locale } = await params;
  const { search } = await searchParams;
  const _dictionary = await getDictionary(locale);

  const categories = await getCategoriesWithCounts(search);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <h1 className="mb-8 font-semibold text-3xl">Browse Categories</h1>

        <CategorySearch />

        <CategoryGrid categories={categories} />
      </div>
    </main>
  );
};

export default CategoriesPage;
