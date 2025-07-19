import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import {
  organizationStructuredData,
  websiteStructuredData,
} from '@repo/seo/structured-data';
import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProductGridServer } from '../../../components/product-grid-server';
import { UnifiedSearchFilters } from '../components/unified-search-filters';

// PPR: Static shell that can be prerendered
function HomePageShell({
  children,
  locale,
}: {
  children: React.ReactNode;
  locale: string;
}) {
  return (
    <main className="min-h-screen bg-background">
      {/* Unified Search Filters - Mobile Only */}
      <div className="md:hidden">
        <UnifiedSearchFilters />
      </div>

      {/* Products Grid */}
      <div className="px-4 pt-4 pb-24 md:mx-auto md:max-w-7xl md:pt-6 md:pb-6">
        {children}
      </div>
    </main>
  );
}

// PPR: Loading component for product grid
function ProductGridLoading() {
  return (
    <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
      {Array.from({ length: 24 }).map((_, i) => (
        <div
          className="aspect-[3/4] animate-pulse rounded-[var(--radius-lg)] bg-secondary"
          key={i}
        />
      ))}
    </div>
  );
}

type HomeProps = {
  params: Promise<{
    locale: string;
  }>;
  searchParams: Promise<{
    sort?: string;
    brand?: string;
    condition?: string;
  }>;
};

export const generateMetadata = async ({
  params,
}: HomeProps): Promise<Metadata> => {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title:
      dictionary.web.home?.meta?.title ||
      'Threadly - Buy and sell fashion online',
    description:
      dictionary.web.home?.meta?.description ||
      'Buy and sell pre-loved fashion items. Discover unique pieces from brands you love at great prices.',
  });
};

const Home = async ({ params, searchParams }: HomeProps) => {
  const { locale } = await params;
  const { sort, brand, condition } = await searchParams;
  const _dictionary = await getDictionary(locale);

  return (
    <>
      {/* PPR: Static structured data can be prerendered */}
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
        type="application/ld+json"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
        type="application/ld+json"
      />

      <HomePageShell locale={locale}>
        {/* PPR: Dynamic product grid with loading state */}
        <Suspense fallback={<ProductGridLoading />}>
          <ProductGridServer
            brand={brand}
            condition={condition}
            limit={24}
            sort={sort}
          />
        </Suspense>
      </HomePageShell>
    </>
  );
};

export default Home;
