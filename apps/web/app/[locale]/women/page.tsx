import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';
import { createMetadata } from '@repo/seo/metadata';
import { getDictionary } from '@repo/internationalization';
import type { Metadata } from 'next';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: "Women's Fashion - Threadly",
    description: "Discover unique women's fashion from our community of sellers. Find dresses, tops, pants, shoes, and accessories from independent designers.",
    keywords: ["women's fashion", "designer clothes", "dresses", "tops", "pants", "shoes", "accessories", "secondhand", "vintage"],
    openGraph: {
      title: "Women's Fashion - Threadly Marketplace",
      description: "Shop curated women's fashion from independent sellers and designers.",
      type: 'website',
      images: [
        {
          url: '/images/women-fashion-hero.jpg',
          width: 1200,
          height: 630,
          alt: "Women's Fashion Collection",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Women's Fashion - Threadly",
      description: "Discover unique women's fashion from our community of sellers.",
      images: ['/images/women-fashion-hero.jpg'],
    },
  });
}

export default function WomenPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Category Navigation */}
      <CategoryNav
        category="women"
        description="Discover unique women's fashion from our community of sellers"
        title="Women's Fashion"
      />

      {/* Product Grid with Women's Filter */}
      <ProductGrid category="women" />
    </div>
  );
}
