import { getDictionary } from '@repo/content/internationalization';
import { createMetadata } from '@repo/content/seo/metadata';
import type { Metadata } from 'next';
import { ProductGrid } from '../(home)/components/product-grid';
import { CategoryNav } from '../components/category-nav';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const dictionary = await getDictionary(locale);

  return createMetadata({
    title: "Kids' Fashion - Threadly",
    description:
      "Discover unique kids' fashion from our community of sellers. Find clothes, shoes, and accessories for babies, toddlers, and children.",
    keywords: [
      "kids' fashion",
      "children's clothes",
      'baby clothes',
      'toddler fashion',
      'kids shoes',
      "children's accessories",
      'secondhand',
      'vintage',
    ],
    openGraph: {
      title: "Kids' Fashion - Threadly Marketplace",
      description:
        "Shop curated kids' fashion from independent sellers and designers.",
      type: 'website',
      images: [
        {
          url: '/images/kids-fashion-hero.jpg',
          width: 1200,
          height: 630,
          alt: "Kids' Fashion Collection",
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: "Kids' Fashion - Threadly",
      description:
        "Discover unique kids' fashion from our community of sellers.",
      images: ['/images/kids-fashion-hero.jpg'],
    },
  });
}

export default function KidsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Category Navigation */}
      <CategoryNav
        category="kids"
        description="Discover unique kids' fashion from our community of sellers"
        title="Kids' Fashion"
      />

      {/* Product Grid with Kids' Filter */}
      <ProductGrid category="kids" />
    </div>
  );
}
