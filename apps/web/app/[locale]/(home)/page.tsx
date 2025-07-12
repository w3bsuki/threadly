import { Suspense } from 'react';
import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { organizationStructuredData, websiteStructuredData } from '@repo/seo/structured-data';
import type { Metadata } from 'next';
import { ProductGridServer } from '../../../components/product-grid-server';
// Fix: Added ADMIN_SECRET environment variable for cache invalidation
import { Button } from '@repo/design-system/components';
import { ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';

// PPR: Static shell that can be prerendered
function HomePageShell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-white">
      {/* Spacer for mobile navigation */}
      <div className="h-32 md:hidden" />
      
      {/* Products Grid - More space for browsing */}
      <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
        {children}
      </div>
    </main>
  );
}

// PPR: Loading component for product grid
function ProductGridLoading() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
      {Array.from({ length: 24 }).map((_, i) => (
        <div key={i} className="aspect-[3/4] bg-muted/20 animate-pulse rounded-lg" />
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
    title: dictionary.web.home?.meta?.title || 'Threadly - Buy and sell fashion online',
    description: dictionary.web.home?.meta?.description || 'Buy and sell pre-loved fashion items. Discover unique pieces from brands you love at great prices.',
  });
};

const Home = async ({ params, searchParams }: HomeProps) => {
  const { locale } = await params;
  const { sort, brand, condition } = await searchParams;
  const dictionary = await getDictionary(locale);

  return (
    <>
      {/* PPR: Static structured data can be prerendered */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      
      <HomePageShell>
        {/* PPR: Dynamic product grid with loading state */}
        <Suspense fallback={<ProductGridLoading />}>
          <ProductGridServer 
            limit={24} 
            sort={sort}
            brand={brand}
            condition={condition}
          />
        </Suspense>
      </HomePageShell>
    </>
  );
};

export default Home;
