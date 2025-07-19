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
    title: "Men's Fashion - Threadly",
    description: "Discover unique men's fashion from our community of sellers. Find shirts, pants, suits, shoes, and accessories from independent designers.",
    keywords: ["men's fashion", "designer clothes", "shirts", "pants", "suits", "shoes", "accessories", "secondhand", "vintage"],
    openGraph: {
      title: "Men's Fashion - Threadly Marketplace",
      description: "Shop curated men's fashion from independent sellers and designers.",
      type: 'website',
      images: [
        {
          url: '/images/men-fashion-hero.jpg',
          width: 1200,
          height: 630,
          alt: "Men's Fashion Collection",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Men's Fashion - Threadly",
      description: "Discover unique men's fashion from our community of sellers.",
      images: ['/images/men-fashion-hero.jpg'],
    },
  });
}

export default function MenPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Category Navigation */}
      <CategoryNav
        category="men"
        description="Discover unique men's fashion from our community of sellers"
        title="Men's Fashion"
      />

      {/* Product Grid with Men's Filter */}
      <ProductGrid category="men" />
    </div>
  );
}
