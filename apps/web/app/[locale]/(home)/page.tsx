import { getDictionary } from '@repo/internationalization';
import { createMetadata } from '@repo/seo/metadata';
import { organizationStructuredData, websiteStructuredData } from '@repo/seo/structured-data';
import type { Metadata } from 'next';
import { ProductGridServer } from '../../../components/product-grid-server';
import { Button } from '@repo/design-system/components';
import { ShoppingBag, Plus } from 'lucide-react';
import Link from 'next/link';
import { env } from '@/env';

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
    title: 'Threadly - Buy and sell fashion online',
    description: 'Buy and sell pre-loved fashion items. Discover unique pieces from brands you love at great prices.',
  });
};

const Home = async ({ params, searchParams }: HomeProps) => {
  const { locale } = await params;
  const { sort, brand, condition } = await searchParams;
  const dictionary = await getDictionary(locale);

  return (
    <>
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
      <main className="min-h-screen bg-white">
        {/* Spacer for mobile navigation */}
        <div className="h-32 md:hidden" />
        
        {/* Products Grid - More space for browsing */}
        <div className="max-w-7xl mx-auto px-4 pt-6 pb-6">
          <ProductGridServer 
            limit={50} 
            sort={sort}
            brand={brand}
            condition={condition}
          />
        </div>
      </main>
    </>
  );
};

export default Home;
